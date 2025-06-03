"use client"

import { useState, useEffect } from "react"
import { Web3Provider } from "@ethersproject/providers"
import { Contract } from "@ethersproject/contracts"
import VoteABI from "../contracts/Vote.json"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"

type Poll = {
	id: number
	question: string
	options: {
		name: string
		votes: number
	}[]
}

type PollData = {
	question: string | string[]
	0: string | string[]
	1: string[]
	2: number[]
}

export default function VotePage() {
	const [newPoll, setNewPoll] = useState({
		question: "",
		options: ["", ""],
	})
	const [isOwner, setIsOwner] = useState(false)
	const [polls, setPolls] = useState<any[]>([])
	const contractAddress = "0xD2956A1CceD8008C2054726C7eAF9B550fea4Fa9"

	const { writeContract, isPending: pendingDeposit, data: txHashDeposit, error: errorDeposit } = useWriteContract()
	const txReceipt = useWaitForTransactionReceipt({
		hash: txHashDeposit,
	})

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

			console.log({ fetchedPolls })

			// Get the number of polls from the length of any of the arrays
			const numPolls = fetchedPolls[0].length
			
			for (let i = 0; i < numPolls; i++) {
				const optionNames = fetchedPolls[1][i]
				const optionVotes = fetchedPolls[2][i]
				
				const poll: Poll = {
					id: i,
					question: fetchedPolls[0][i],
					options: optionNames.map((name: string, index: number) => ({
						name: name,
						votes: Number(optionVotes[index])
					}))
					}
				polls.push(poll)
			}

			console.log({ polls })

			setPolls(polls)
		} catch (error) {
			console.error("Error loading polls:", error)
		}
	}

	const addOption = () => {
		setNewPoll((prev) => ({
			...prev,
			options: [...prev.options, ""],
		}))
	}

	const removeOption = (index: number) => {
		setNewPoll((prev) => ({
			...prev,
			options: prev.options.filter((_, i) => i !== index),
		}))
	}

	const handleCreatePoll = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			writeContract({
				abi: VoteABI.abi,
				address: contractAddress,
				functionName: "createPoll",
				args: [newPoll.question, newPoll.options.filter((opt) => opt.trim() !== "")],
			})
			await loadPolls()
			setNewPoll({ question: "", options: ["", ""] })
		} catch (error) {
			console.error("Error creating poll:", error)
		}
	}

	const handleVote = async (pollId: number, optionId: number) => {
		try {
			writeContract({
				abi: VoteABI.abi,
				address: contractAddress,
				functionName: "vote",
				args: [pollId, optionId],
			})

			await loadPolls()
		} catch (error) {
			console.error("Error voting:", error)
		}
	}

	const handleEndPoll = async (pollId: number) => {
		try {
			writeContract({
				abi: VoteABI.abi,
				address: contractAddress,
				functionName: "endPoll",
				args: [pollId],
			})
			await loadPolls()
		} catch (error) {
			console.error("Error ending poll:", error)
		}
	}

	const getTotalVotes = (votes: number[]) => {
		return votes.reduce((a, b) => a + b, 0)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="max-w-4xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-16">
					<h1 className="text-4xl font-light text-slate-800 mb-4">Vote</h1>
					<div className="w-12 h-px bg-slate-300 mx-auto"></div>
				</div>

				{/* Create Poll Section */}
				{isOwner && (
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
											{index >= 2 && (
												<button type="button" onClick={() => removeOption(index)} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
													Supprimer
												</button>
											)}
										</div>
									))}
								</div>

								<div className="flex gap-4 pt-4">
									{newPoll.options.length < 10 && (
										<button type="button" onClick={addOption} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
											+ Ajouter une option
										</button>
									)}
								</div>

								<button onClick={handleCreatePoll} className="w-full py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-light text-lg">
									Créer le sondage
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Polls Section */}
				<div className="space-y-8">
					{polls.map((poll) => {
						const totalVotes = getTotalVotes(poll.options.map((option: { name: string, votes: number }) => option.votes))

						return (
							<div key={poll.id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-sm">
								<h3 className="text-xl font-light text-slate-800 mb-8">{poll.question}</h3>

								<div className="space-y-6">
									{poll.options.map((option: { name: string, votes: number }, optionId: number) => {
										const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0

										return (
											<div key={optionId} className="group">
												<div className="flex items-center justify-between mb-3">
													<span className="text-slate-700 font-light">{option.name}</span>
													<div className="flex items-center gap-6">
														<span className="text-sm text-slate-500">
															{option.votes} vote{option.votes !== 1 ? "s" : ""} ({percentage.toFixed(1)}%)
														</span>
														<button onClick={() => handleVote(poll.id, optionId)} className="px-6 py-2 text-sm bg-slate-700 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 font-light">
															Voter
														</button>
													</div>
												</div>

												<div className="h-1 bg-slate-100 rounded-full overflow-hidden">
													<div className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
												</div>
											</div>
										)
									})}
								</div>

								{totalVotes > 0 && (
									<div className="mt-6 pt-6 border-t border-slate-200">
										<span className="text-sm text-slate-500">
											Total: {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
										</span>
									</div>
								)}

								{isOwner && (
									<div className="mt-8 pt-6 border-t border-slate-200">
										<button onClick={() => handleEndPoll(poll.id)} className="text-sm text-red-400 hover:text-red-600 transition-colors font-light">
											Terminer le sondage
										</button>
									</div>
								)}
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

