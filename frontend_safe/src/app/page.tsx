"use client"

import { useState, useEffect, use } from "react"
import VoteABI from "../contracts/Vote.json"
import { Loader2 } from "lucide-react"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { sepolia } from "viem/chains"

type Poll = {
	id: number
	question: string
	option1: string
	option2: string
	votes1: string[]
	votes2: string[]
	isActive: boolean
	maxVotes: number
}

export default function VotePage() {
	const [newPoll, setNewPoll] = useState({
		question: "",
		options: ["", ""],
		maxVotes: 3,
	})
	const [isOwner, setIsOwner] = useState(false)
	const [polls, setPolls] = useState<Poll[]>([])
	const [newPollFormVisible, setNewPollFormVisible] = useState(false)
	const contractAddress = "0xe1F7D5880948C31fD7187B50688bE2d1974BAC7D"

	const { writeContract, isPending, data: txData, status: txStatus } = useWriteContract()
	const txReceipt = useWaitForTransactionReceipt({
		hash: txData,
	})

	const hasVoted = (pollId: number) => {
		return polls.find((poll) => poll.id === pollId)?.votes1.includes(address) || polls.find((poll) => poll.id === pollId)?.votes2.includes(address)
	}

	const { address } = useAccount()

	const { data: owner } = useReadContract({
		abi: VoteABI.abi,
		address: contractAddress,
		functionName: "getOwner",
	})

	const {
		data: pollsData,
		refetch: refetchPolls,
		error: errorPolls,
	} = useReadContract({
		abi: VoteABI.abi,
		address: contractAddress,
		functionName: "getAllPolls",
	})


	useEffect(() => {
		if (!owner || !address) return
		setIsOwner(owner === address)
	}, [owner, address])

	useEffect(() => {
		if (txReceipt.isSuccess) {
			loadPolls()
			setNewPollFormVisible(false)
			setNewPoll({ question: "", options: ["", ""], maxVotes: 3 })
		}
	}, [txReceipt.isSuccess])

	useEffect(() => {
		loadPolls()
	}, [])

	const loadPolls = async () => {
		try {
			const { data: fetchedPolls } = await refetchPolls() as { data: any[] }
			if (!fetchedPolls || !Array.isArray(fetchedPolls[0])) {
				setPolls([])
				return
			}

			const polls: Poll[] = []

			// Get the number of polls from the length of any of the arrays
			const numPolls = fetchedPolls[0].length
			
			for (let i = 0; i < numPolls; i++) {
				const poll: Poll = {
					id: i,
					question: fetchedPolls[0][i],
					option1: fetchedPolls[1][i],
					option2: fetchedPolls[2][i],
					votes1: fetchedPolls[3][i],
					votes2: fetchedPolls[4][i],
					isActive: fetchedPolls[5][i],
					maxVotes: fetchedPolls[6][i]
				}
				polls.push(poll)
			}


			setPolls(polls.reverse())
		} catch (error) {
			console.error("Error loading polls:", error)
		}
	}



	const handleCreatePoll = async () => {
		try {
			const args = [newPoll.question, newPoll.options[0], newPoll.options[1], newPoll.maxVotes]
			console.log({args})
			writeContract({
				abi: VoteABI.abi,
				address: contractAddress,
				functionName: "createPoll",
				args: args,
				chain: sepolia,
				account: address,
			})
			// await loadPolls()
			// setNewPoll({ question: "", options: ["", ""], maxVotes: 3 })
		} catch (error) {
			console.error("Error creating poll:", error)
		}
	}

	const handleVote = async ({pollId, voteFor1}: {pollId: number, voteFor1: boolean}) => {
		try {
			writeContract({
				abi: VoteABI.abi,
				address: contractAddress,
				functionName: "vote",
				args: [pollId, voteFor1],
				chain: sepolia,
				account: address,
			})
		} catch (error) {
			console.error("Error voting:", error)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="max-w-4xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-16">
					<h1 className="text-4xl font-light text-slate-800 mb-4">Vote</h1>
					<div className="w-12 h-px bg-slate-300 mx-auto"></div>
				</div>

				{isOwner && (
					<div className="mb-16">
						<button onClick={() => setNewPollFormVisible(!newPollFormVisible)} className="px-6 py-2 text-sm bg-slate-700 cursor-pointer hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 font-light">
							{newPollFormVisible ? "Fermer" : "Créer un sondage"}
						</button>
					</div>
				)}

				{/* Create Poll Section */}
				{isOwner && newPollFormVisible && (
					<div className="mb-16">
						<div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-sm">
							<h2 className="text-xl font-light text-slate-700 mb-8">Créer un sondage</h2>
							<div className="space-y-6">
								<div>
									<input
										type="text"
										value={newPoll.question}
										onChange={(e) => setNewPoll((prev) => ({ ...prev, question: e.target.value }))}
										placeholder="Votre question..."
										className="w-full px-0 py-4 text-lg text-black bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:outline-none transition-colors placeholder-slate-400"
									/>
								</div>

								<div>
									<label htmlFor="maxVotes" className="text-sm text-slate-500">Nombre de votes maximum</label>
									<input
										type="number"
										value={newPoll.maxVotes}
										onChange={(e) => setNewPoll((prev) => ({ ...prev, maxVotes: parseInt(e.target.value) }))}
										placeholder="Nombre de votes maximum"
										className="w-full px-0 py-4 text-lg text-black bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:outline-none transition-colors placeholder-slate-400"
									/>
								</div>

								<div className="space-y-4">
									{newPoll.options.map((option, index) => (
										<div key={index} className="flex items-center gap-4">
											<div className="w-2 h-2 rounded-full bg-slate-300"></div>
											<input
												type="text"
												value={option}
												onChange={(e) => {
													const newOptions = [...newPoll.options]
													newOptions[index] = e.target.value
													setNewPoll((prev) => ({ ...prev, options: newOptions }))
												}}
												placeholder={`Option ${index + 1}`}
												className="flex-1 px-0 py-2 text-black bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:outline-none transition-colors placeholder-slate-400"
											/>
										</div>
									))}
								</div>

								<button disabled={isPending} onClick={handleCreatePoll} className="w-full py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-light text-lg cursor-pointer text-center flex items-center justify-center">
									{isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le sondage"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Polls Section */}
				<div className="space-y-8">
					{polls.map((poll) => {
						const totalVotes = poll.votes1.length + poll.votes2.length

						return (
							<div key={poll.id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-sm">
								<div className="flex items-center justify-between mb-8">
									<h3 className="text-xl font-light text-slate-800">{poll.question}</h3>
									<p className="text-sm text-slate-500">
										{poll.isActive ? "Actif" : "Terminé"}
									</p>
									<p className="text-sm text-slate-500">
										{totalVotes} / {poll.maxVotes} votes
									</p>
								</div>
								<div className="space-y-6">

									<div className="group">
												<div className="flex items-center justify-between mb-3">
													<span className="text-slate-700 font-light">{poll.option1}</span>
													<div className="flex items-center gap-6">
														<span className="text-sm text-slate-500">
															{poll.votes1.length} vote{poll.votes1.length !== 1 ? "s" : ""}
														</span>
														{!hasVoted(poll.id) && (
															<button onClick={() => handleVote({pollId: poll.id, voteFor1: true})} className="px-6 py-2 text-sm bg-slate-700 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 font-light cursor-pointer">
																Voter
															</button>
														)}
													</div>
												</div>

												<div className="h-1 bg-slate-100 rounded-full overflow-hidden">
													<div className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${poll.votes1.length / totalVotes * 100}%` }} />
												</div>
											</div>
											<div className="group">
												<div className="flex items-center justify-between mb-3">
													<span className="text-slate-700 font-light">{poll.option2}</span>
													<div className="flex items-center gap-6">
														<span className="text-sm text-slate-500">
															{poll.votes2.length} vote{poll.votes2.length !== 1 ? "s" : ""}
														</span>
														{!hasVoted(poll.id) && (
															<button onClick={() => handleVote({pollId: poll.id, voteFor1: false})} className="px-6 py-2 text-sm bg-slate-700 hover:bg-slate-800 cursor-pointer hover:text-white rounded-lg transition-all duration-200 font-light">
																Voter
															</button>
														)}
													</div>
												</div>
												<div className="h-1 bg-slate-100 rounded-full overflow-hidden">
													<div className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${poll.votes2.length / totalVotes * 100}%` }} />
												</div>
											</div>

								</div>
								<div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
								{hasVoted(poll.id) ? (
									<div>
										<span className="text-sm text-slate-500">
											Vous avez voté pour {poll.votes1.includes(address) ? poll.option1 : poll.option2}
										</span>
									</div>
								) : (
									<div>
										<span className="text-sm text-slate-500">
											Vous n&apos;avez pas encore voté
										</span>
									</div>
								)}

								 
									<div>
										<span className="text-sm text-slate-500">
											Total: {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
										</span>
									</div>
								
								</div>
							</div>
						)
					})}
				</div>

				{polls.length === 0 && (
					<div className="text-center py-16">
						<div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
							<div className="w-6 h-6 rounded-full bg-slate-300"></div>
						</div>
						<p className="text-slate-500 font-light">Aucun sondage disponible</p>
					</div>
				)}
			</div>
		</div>
	)
}

