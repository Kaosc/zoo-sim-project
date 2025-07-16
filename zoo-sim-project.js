/**
 *  Definition of Variables:
 *
 *   - AREA = 500X500 = 250,000
 *   - SHEEP = 30 (15 M, 15 F), velocity = 2 unit
 *   - COW = 10 (5M, 5F), velocity = 2 unit
 *   - CHICKEN = 10, velocity = 1 unit
 *   - COCKEREL = 10, velocity = 1 unit
 *   - WOLF = 10 (5M, 5F), velocity = 3 unit, can hunt sheep, chicken, and cockerel with in 4 unit distance
 *   - LION = 8 (4M, 4F), velocity = 4 unit, can hunt cow, sheep with in 5 unit distance
 *   - HUNTER = 1, velocity = 1 unit, can hunt all with in 8 unit distance
 */

/**
 *  Known Simulation Rules & Requests:
 * 
 *   - Entities cannot go outside the area
 *   - If the same entitys with different gender are in the 3 unit distance, they will mate and produce a new animal of the same type with the same but random gender.
 *   - find total animal count after 1000 unit time
 */

/** 
 *  Details that are not given in the problem but are assumed for the simulation:
 * 
 *   - After the mating happens, the new offspring will be placed in a random empty position on the map.
 *   - After the matting happens the position of either the current entity or the neighbor entity will be changed to avoid infinite mating.
 *   - The simulation will run for 1000 time units, and during each time unit, only one entity will move randomly based on its velocity.
*/


// TypeScript Types (for reference, not used in the code) //

// type Entity = {
//     name: string
//     velocity: number
//     gender?: "M" | "F" | null
// }

// type EntityConfig = {
//     count: number
//     velocity: number
//     gender?: boolean
// }

// type Zoo = {
//     area: {
//         height: number
//         width: number
//     }
//     entityNames: string[]
//     entitys: Record<string, EntityConfig>
//     time: number
// }

let zoo = {
	area: {
		height: 500,
		width: 500,
	},
	entityNames: ["sheep", "cow", "chicken", "cockerel", "wolf", "lion", "hunter"],
	entitys: {
		sheep: { count: 30, velocity: 2, hasGender: true },
		cow: { count: 10, velocity: 2, hasGender: true },
		chicken: { count: 10, velocity: 1 },
		cockerel: { count: 10, velocity: 1 },
		wolf: { count: 10, velocity: 3, hasGender: true },
		lion: { count: 8, velocity: 4, hasGender: true },
		hunter: { count: 1, velocity: 1 },
	},
	time: 1000,
}

const hunterEntitys = ["wolf", "lion", "hunter"]

const huntingDistances = {
	wolf: 4,
	lion: 5,
	hunter: 8,
}

function canHunt(hunter, prey) {
	return (
		(hunter === "wolf" && (prey === "sheep" || prey === "chicken" || prey === "cockerel")) ||
		(hunter === "lion" && (prey === "cow" || prey === "sheep")) ||
		hunter === "hunter"
	)
}

function simulateZoo() {
	console.log("\n------ Zoo Simulation Started ------\n")

	// Create map
	const { height, width } = zoo.area
	let map = Array.from({ length: height }, () => Array(width).fill(null)) // (Entity | null)[][]

	// Place entitys in the map
	Object.entries(zoo.entitys).forEach(([name, config]) => {
		const count = config.count
		const hasGender = config.hasGender || false

		for (let i = 0; i < count; i++) {
			let x, y

			do {
				x = Math.floor(Math.random() * width)
				y = Math.floor(Math.random() * height)
			} while (map[y][x] !== null)

			map[y][x] = {
				name: name,
				velocity: config.velocity,
				// assign half male and half female if gender is true
				gender: hasGender ? (i < count / 2 ? "M" : "F") : null,
			}
		}
	})

	const time = zoo.time
	let totalHunting = 0
	let totalMating = 0

	for (let t = 0; t < time; t++) {
		// Choose a random entity to simulate movement
		const entityName = zoo.entityNames[Math.floor(Math.random() * zoo.entityNames.length)]
		const entityVelocity = zoo.entitys[entityName].velocity

		// Find all positions of the chosen entity
		const entityPositions = [] // { x: number; y: number }[]
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (map[y][x]?.name === entityName) {
					entityPositions.push({ x, y })
				}
			}
		}

		// Select a random entity from the positions and move it as per its velocity
		if (entityPositions.length > 0) {
			const randomEntityIndex = Math.floor(Math.random() * entityPositions.length)
			const { x, y } = entityPositions[randomEntityIndex]

			// Calculate new position
			let newX = x + Math.floor(Math.random() * (2 * entityVelocity + 1)) - entityVelocity
			let newY = y + Math.floor(Math.random() * (2 * entityVelocity + 1)) - entityVelocity

			// Ensure the new position is within bounds
			newX = Math.max(0, Math.min(width - 1, newX))
			newY = Math.max(0, Math.min(height - 1, newY))

			// Move the entity (only if new position is empty)
			if (map[newY][newX] === null) {
				map[newY][newX] = map[y][x] // Move entity
				map[y][x] = null // Clear old position
			}
		}

		// Check for mating
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const currentEntity = map[y][x]

				if (currentEntity && currentEntity.gender) {
					// Check for nearby entities of the same type with different gender
					// within a distance of 3 units in x and y directions

					for (let dy = -3; dy <= 3; dy++) { // y distance
						for (let dx = -3; dx <= 3; dx++) { // x distance

							if (dy === 0 && dx === 0) continue // Skip if it's the same entity

							const newY = y + dy
							const newX = x + dx

							// Check if new position is within bounds
							if (newY >= 0 && newY < height && newX >= 0 && newX < width) {

								const neighborEntity = map[newY][newX]

								// Check if there's an entity at the new position
								if (
									neighborEntity &&
									neighborEntity.name === currentEntity.name &&
									neighborEntity.gender &&
									neighborEntity.gender !== currentEntity.gender
								) {
									// Mating occurs, increase count of the entity
									zoo.entitys[currentEntity.name].count += 1
									console.log(`Mating occurred: ${currentEntity.name} at (${x}, ${y}) and (${newX}, ${newY})`)

									totalMating += 1

									// Add new offspring to a random empty spot
									while (true) {
										const randomX = Math.floor(Math.random() * width)
										const randomY = Math.floor(Math.random() * height)

										if (map[randomY][randomX] === null) {
											map[randomY][randomX] = {
												name: currentEntity.name,
												velocity: currentEntity.velocity,
												gender: Math.random() < 0.5 ? "M" : "F",
											}
											break
										}
									}

									// We need to change either the current entity or the neighbor entity position to avoid infinite mating
									// if they ll stay at the same position the mating will continue.
									while (true) {
										const randomX = Math.floor(Math.random() * width)
										const randomY = Math.floor(Math.random() * height)

										if (map[randomY][randomX] === null) {
											map[randomY][randomX] = neighborEntity
											map[newY][newX] = null // Clear the neighbor's old position
											break
										}
									}
								}
							}
						}
					}
				}
			}
		}

		// Check for hunting
		for (let y = 0; y < height; y++) { // y distance
			for (let x = 0; x < width; x++) { // x distance
				const currentEntity = map[y][x]

				if (currentEntity && hunterEntitys.includes(currentEntity.name)) {
					const huntingDistance = huntingDistances[currentEntity.name]

					// Check for prey within hunting distance
					for (let dy = -huntingDistance; dy <= huntingDistance; dy++) { // y distance
						for (let dx = -huntingDistance; dx <= huntingDistance; dx++) { // x distance
							if (dy === 0 && dx === 0) continue // Skip self

							const newY = y + dy
							const newX = x + dx

							// Check if new position is within bounds
							if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
								const prey = map[newY][newX]

								// Check if there's an entity at the new position
								if (prey && canHunt(currentEntity.name, prey.name)) {
									// Hunt the prey
									zoo.entitys[prey.name].count -= 1
									map[newY][newX] = null // Remove prey from the map
									console.log(`${currentEntity.name} hunted ${prey.name} at (${newX}, ${newY})`)

									totalHunting += 1
								}
							}
						}
					}
				}
			}
		}
	}

	// Final total count of all entities
	const finalTotalCount = Object.entries(zoo.entitys).reduce((acc, [name, entity]) => {
		acc[name] = entity.count
		return acc
	}, {}) // Record<string, number>

	// Compare final count with initial count log results
	console.log("\n-------\ Simulation Results -------\n")
	console.log("Final Total Count:", Object.values(finalTotalCount).reduce((sum, count) => sum + count, 0))
	console.log("Final entity counts:", finalTotalCount)

	if (totalHunting > 0 || totalMating > 0) {
		console.log("\n--------\ Action Summary --------\n")
		console.log(`Total Hunting: ${totalHunting}`)
		console.log(`Total Mating: ${totalMating}`)
	} else {
		console.log("No Hunting or Mating performed during the simulation.")
	}

	console.log("\n-------------------------------")
}

simulateZoo()
