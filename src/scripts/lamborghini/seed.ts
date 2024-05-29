import { writeFile } from "fs/promises"
import data1 from "./data1.json"

const main = async () => {
    for (let i = 0; i < data1.length; i++) {
        const id = i + 1
        const car = data1[i]
        const metadata = {
            name: car.name,
            description: car.description,
            image: `https://nftverse-backend.zenno.moe/static/lamborghini/images/${id}`,
            animation_url: `https://nftverse-backend.zenno.moe/static/lamborghini/models/${id}.glb`,
            attributes: [
                {
                    trait_type: "Color",
                    value: car.color
                },
                {
                    trait_type: "Power",
                    value: car.power
                },
                {
                    trait_type: "Top Speed",
                    value: car.speed
                },
                {
                    trait_type: "Tier",
                    value: car.tier
                },
                {
                    trait_type: "Type",
                    value: car.type
                },
                {
                    trait_type: "Year",
                    value: car.year
                },
            ]
        }
        await writeFile(__dirname + `/../../static/lamborghini/metadata/${id}.json`, JSON.stringify(metadata))
        console.info(id)
    }
}

main()