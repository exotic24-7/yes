// in addition to Stats, we cache another modified version of stats for the permutation of pvp, tanksmith, and anything else 
let cachedStats = undefined;
let cachedState = ['please regen', false]; // is1v1, isTs

let is1v1 = (biomeManager !== undefined && biomeManager.getCurrentBiome() === '1v1');
let isTs = (window.characterSelector !== undefined && window.characterSelector.selectedIndex == "1");

function generateCachedStats(is1v1, isTs) {
    cachedState[0] = is1v1;
    cachedState[1] = isTs;

    // in pvp we modify rarity numbers for custom balance.
    var oldRarityStats = Stats.rarities;
    if (is1v1) {
        Stats.rarities = [Stats.rarities[0]];
        for (let i = 1; i < oldRarityStats.length; i++) {
            Stats.rarities[i] = {}
            for (let key in oldRarityStats[i]) {
                Stats.rarities[i][key] = Stats.rarities[i - 1][key] * 1.05;
            }
            Stats.rarities[i].name = oldRarityStats[i].name;
        }

        BaseStats.rarities = Stats.rarities;
    }

    // actually calculate the stats
    window.calculateStats(is1v1, isTs);

    // clone the stats and store them in our cache
    cachedStats = structuredClone({ petals: Stats.petals, enemies: Stats.enemies });

    // reset
    Stats.rarities = BaseStats.rarities = oldRarityStats;

    // recalculate the old stats
    window.calculateStats(false);
}

class StatsBox {
    constructor(type, stats, mode = 'petals', amount, rarity) {
        this.name = type;
        this.type = type;
        this.description = Descriptions[mode][type] ? Descriptions[mode][type] : "Something interesting...";
        this.mode = mode;
        this.amount = amount;
        this.rarity = rarity;

        this.h = this.w = this.x = this.y = 0;
        this.image = null;

        this.generateData(mode, type, stats)
    }
    generateData(mode, type, stats) {

        if (cachedState[0] !== is1v1 || cachedState[1] !== isTs) {
            generateCachedStats(is1v1, isTs)
        }

        if (mode == "petals") {
            stats = cachedStats.petals[this.type][this.rarity];
            if (this.type == "Fangs") this.name = "Fang";
            if (this.type == "Egg") this.name = "Beetle Egg";
            if (this.type == "Hexagon") this.name = "ӇЄҲƛƓƠƝ";

            if (this.type == "Trinket of the Hivemind") this.description = [
                { text: "You can hear distant humming within the trinket... Converts", color: "#ffffff" },
                { text: Colors.rarities[stats.maximumRarity].name, color: Colors.rarities[stats.maximumRarity].color },
                { text: "Soldier Ant summons and below into Soldier Termites.", color: "#ffffff" }
            ]

            if (this.type == "Trinket of the Sea") this.description = [
                { text: "The sounds of the sea fills your ears... Converts", color: "#ffffff" },
                { text: Colors.rarities[stats.maximumRarity].name, color: Colors.rarities[stats.maximumRarity].color },
                { text: "Sandstorms and below into Whirlpools", color: "#ffffff" }
            ]

            if (this.type == "Trinket of the Wild") this.description = [
                { text: "A faint grassy smell is emitted from this trinket... All", color: "#ffffff" },
                { text: Colors.rarities[stats.maximumRarity].name, color: Colors.rarities[stats.maximumRarity].color },
                { text: "Ruby Summons and below convert into dangerous Mossy Rubies!", color: "#ffffff" }
            ]

            if ((this.type == "Jellyfish Egg") && this.rarity >= 14) this.description = "It's gonna zap everything to death. Pet Jellyfish deal 4% of their max health as zap damage."
            if ((this.type == "Neuroflare Egg") && this.rarity >= 14) this.description = "It's gonna zap everything to death. Pet Jellyfish deal 2% of their max health as zap damage."
            if (this.type == "Third Eye" && this.rarity === 13) this.description = "Something lofdjf will never get."
            if (this.type == "Mandible" && this.rarity >= 13) this.description = "Has a 15% chance of doing 20x damage. Critical chance increases to 30% when 3 or more flowers are dead.";
            if (this.type == "Blood Mandible" && this.rarity >= 13) this.description = "Has a 15% chance of doing 20x damage. Critical chance increases to 30% when 3 or more flowers are dead. Only deals self damage on critical hits.";
            if (this.type == "Basic" && this.rarity >= 7) this.description = `A nice petal, not very strong. Has a 0.1% chance to increase special wave chance by ${this.rarity - 7}% every tick.`
            if (this.type == "Faster" && this.rarity >= 13) this.description += "                                              "
            if (this.type == "Amulet of Grace" && this.rarity == 11) this.description = "Forged by the Ancients to extend their life, it has long since lost the flame that fueled it. Maybe if it was ignited again, it could be used to extend your own life once more..."
            if (this.type == "Amulet of Grace" && this.rarity < 11) this.description = "An odd, warm feeling overtakes you as you peer into the gem. You grow calm, but it was only for a moment. Could a more powerful amulet could harness more of this magic..?"
            if (this.type == "Amulet of Time" && this.rarity == 11) this.description = "In times since past, this was fought over relentlessly as it was believed to slow the enemies advances. Lacking the power it once had, maybe if recharged it could aid against the onslaught..."
            if (this.type == "Amulet of Time" && this.rarity < 11) this.description = "Staring into the darkness within, memories of a time long lost fade in and out. A faint glow eminates from the deep center. Perhaps if this amulet had more power..?"
            if (this.type == "Amulet of Divergence" && this.rarity == 11) this.description = "This was merely the prototype to something of far greater strength... capable of warping reality itself. Perhaps merging them can generate power enough to use it for your own conquest?"
            if (this.type == "Amulet of Divergence" && this.rarity < 11) this.description = "Faint lights appear from within deep inside the stored gem. There appears to be movement inside, but it's too hard to discern what is causing it. What if more power was contained..?"
            if (this.type == "Jelly" && this.rarity >= 13) this.description = "With advanced technological advancements from bioengineered Jellyfish, this Jelly only deals knockback if you are defending."
            if (this.type == "Powder" && this.rarity >= 13) this.description = "Increases movement speed if not attacking, but decreases health. Reduces player radius. Does not stack."
            if (this.type == "Neutron Star" && this.rarity >= 13) this.description = "A decoy that forcefully attracts mobs with the strength of gravity. Free will is just an illusion after all. Aims in your movement direction. Causes mobs to forcefully compress into each other, slowly wearing off over 3 seconds."
            if (this.type == "Honey" && this.rarity >= 8) this.description = "A rocket-powered decoy that attracts mobs away from flowers."

            if (this.type == "Horn") this.description = [
                { text: "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maximumRarity].name, color: Colors.rarities[stats.maximumRarity].color },
                { text: "mobs.", color: "#ffffff" }
            ]

            if (this.type == "Horn" && this.rarity >= 13) this.description = [
                { text: "Not only horns the wave, but also gives a slight chance for every horned mob to give drops regardless. Horns up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maximumRarity].name, color: Colors.rarities[stats.maximumRarity].color },
                { text: "mobs.", color: "#ffffff" }
            ]
            if (this.type == "Magnet" && this.rarity >= 14) this.description = "Collects drops from further away, blocks electric attacks and gives a slight chance to duplicate drops for yourself upon pickup."
            if (this.type == "Jolt" && this.rarity >= 13) this.description = "A jolt so powerful, it teleports all players and pets across the map, at the cost of a high cooldown time. Great for escaping threats!"
            if (this.type == "Bubble" && this.rarity >= 13) this.description = "Stated to be the oldest bubble ever, this ancient sphere has since propagated into every bubble that has come since it's inception. Harnessing its bubble blowing abilities will allow you to create your own to aid you."
            if (this.type == "Bubble" && this.rarity >= 14) this.description = "An even older bubble. This unc sphere has had nearly 67 millenia of existence. It not only blows a really fat bubble, but it teleports to you every second."
            if (this.type == "Amulet of Divergence" && this.rarity >= 14) this.description = "An ancient relic believed to have the power of creating a false reality. Limited use per player per game. (Attack or defend to absorb differently; only usable after wave spawning ends)"
            if (this.type == "Waterlogged Compass" && this.rarity >= 14) this.description = "Shows the number of the highest rarity spawning, and also shows Wave Data, but only after all mobs have already spawned."

            if (this.type == "Ruby") this.description = [
                { text: "A mythical gem infused with the power of friendship. Works up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxReviveRarity].name, color: Colors.rarities[stats.maxReviveRarity].color },
                { text: "mobs.", color: "#ffffff" }
            ]
            if (this.type == "Emerald") this.description = [
                { text: "A mythical gem infused with the power of genesis. Works up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxDuplicationRarity].name, color: Colors.rarities[stats.maxDuplicationRarity].color },
                { text: "mobs.", color: "#ffffff" }
            ]
            if (this.type == "Sapphire") this.description = [
                { text: "A mythical gem infused with the power of transformation. Works up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxConversionRarity].name, color: Colors.rarities[stats.maxConversionRarity].color },
                { text: "mobs.", color: "#ffffff" }
            ]

            if (this.type == "Emerald" && this.rarity >= 13) this.description = [
                { text: "A mythical gem infused with the power of genesis. Works up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxDuplicationRarity].name, color: Colors.rarities[stats.maxDuplicationRarity].color },
                { text: "mobs. Converting", color: "#ffffff" },
                { text: Colors.rarities[stats.maxDuplicationRarity].name, color: Colors.rarities[stats.maxDuplicationRarity].color },
                { text: "mobs disables the slot for the rest of the wave.", color: "#ffffff" },
            ]
            if (this.type == "Sapphire" && this.rarity >= 13) this.description = [
                { text: "A mythical gem infused with the power of transformation. Works up to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxConversionRarity].name, color: Colors.rarities[stats.maxConversionRarity].color },
                { text: "mobs. Converting", color: "#ffffff" },
                { text: Colors.rarities[stats.maxConversionRarity].name, color: Colors.rarities[stats.maxConversionRarity].color },
                { text: "mobs disables the slot for the rest of the wave.", color: "#ffffff" },
            ]
            if (this.type == "Ruby" && stats.minimumConvert) this.description = [
                { text: "A mythical gem infused with the power of friendship.", color: "#ffffff" },
                { text: Colors.rarities[stats.minimumConvert - 1].name, color: Colors.rarities[stats.minimumConvert - 1].color },
                { text: "rarity mobs and below get converted to", color: "#ffffff" },
                { text: Colors.rarities[stats.maxReviveRarity].name, color: Colors.rarities[stats.maxReviveRarity].color },
                { text: "summons, but", color: "#ffffff" },
                { text: Colors.rarities[stats.minimumConvert].name, color: Colors.rarities[stats.minimumConvert].color },
                { text: "rarity mobs and above get converted into", color: "#ffffff" },
                { text: Colors.rarities[stats.maxReviveRarity + 1].name, color: Colors.rarities[stats.maxReviveRarity + 1].color },
                { text: "summons.", color: "#ffffff" },
            ]
            if (this.type == "Shiny Bubble" && this.rarity >= 14) this.description = "Propels the flower in the direction you are facing. Teleportation keybind is [F]."
            if (this.type == "Shiny Leaf") this.description = this.description = [
                { text: Descriptions.petals['Shiny Leaf'] + " Requires", color: "#ffffff" },
                { text: "Constant Healing", color: statColors.heal },
                { text: "stronger than " + formatAmountHighPrecision(stats.health / 6) + "/s.", color: "#ffffff" },
            ]


            // Blessed with the might of Thor, this shockingly deadly lightning can clear crowds of enemies like no other. The more it chains, the harder it hits (up to a maximum).

            if (this.type == "Shiny Iris") this.description = this.description = [
                { text: "Blessed with the power of the sun god himself, this glowing iris decimates waves of enemies with potent", color: "#ffffff" },
                { text: "poison", color: statColors.poison },
                { text: "sourced from the skies. The more enemies that are struck, the more the", color: "#ffffff" },
                { text: "poison", color: statColors.poison },
                { text: "hurts for all of them.", color: "#ffffff" },
            ]
            if (this.type == "Shiny Lightning") this.description = this.description = [
                { text: "Blessed with the might of Thor, this shockingly deadly", color: "#ffffff" },
                { text: "lightning", color: statColors.lightning },
                { text: "can clear crowds of enemies like no other. The more it chains, the harder it hits (up to a maximum).", color: "#ffffff" }
            ]
            if (this.type == "Shiny Egg") this.description = this.description = [
                { text: "This egg hatches a very hungy beetle! Each kill you get, it grows in size, to a max. Mobs that are both below rarity", color: "#ffffff" },
                { text: Colors.rarities[stats.maxEat + 1].name, color: Colors.rarities[stats.maxEat + 1].color },
                { text: "and smaller than 1/2 of the beetle get eaten whole.", color: "#ffffff" },
            ]

            if (typeof this.description == "string") {
                let prevT = this.description
                this.description = []
                this.description.push({ text: prevT, color: "#ffffff" });
            }

            this.topstats = []
            this.bottomstats = [];

            for (let key in stats) {
                if (!isTs && [
                    'tanksmithRadius'
                ].includes(key)) continue;

                if (
                    [
                        "reload",
                        'lifespan',
                        'hatchTime',
                        'spawnSystem',
                        'timeToPop',
                        'timeLimit'
                    ].includes(key)
                ) {

                    if (key == "hatchTime" && isTs) continue;

                    if (isTs) if (key == "reload" && stats.tanksmithCooldown) {
                        this.topstats.push({
                            key,
                            value: stats.tanksmithCooldown / 30,
                            color: statColors[key]
                        });
                        if (stats.tanksmithShootCooldown) {
                            this.topstats.push({
                                key: "shootCd",
                                value: stats.tanksmithCooldown / 30,
                                color: statColors[key]
                            });
                        } else {
                            this.topstats.push({
                                key: "shootCd",
                                value: stats[key],
                                color: statColors[key]
                            });
                        }
                        continue;
                    } else if (key == "reload") {
                        this.topstats.push({
                            key,
                            value: stats[key] * 1.5,
                            color: statColors[key]
                        });
                        if (stats.tanksmithShootCooldown) {
                            this.topstats.push({
                                key: "shootCd",
                                value: stats.tanksmithCooldown / 30,
                                color: statColors[key]
                            });
                        } else {
                            this.topstats.push({
                                key: "shootCd",
                                value: stats[key],
                                color: statColors[key]
                            });
                        }
                        continue;
                    }

                    if (!(key == "timeToPop" && stats[key] == 0)) this.topstats.push({
                        key,
                        value: stats[key],
                        color: statColors[key]
                    })

                    if (key == "spawnSystem") {

                        let massDif = 0.8
                        if (this.rarity <= 13) { massDif *= 2.25 } else {
                            if (this.rarity >= 14) massDif *= 0.866
                            if (this.rarity == 15) massDif *= 2.875
                            if (this.rarity >= 16) massDif *= 1.5
                        }
                        // if (stats[key] >= 18) massDif *= 1.5

                        this.bottomstats.push({
                            key: "summon",
                            value: {
                                rarity: stats[key][0], type: "Sandstorm", amount: stats[key][2], substats: {
                                    damage: Stats.rarities[this.rarity].petalDamage * 1.2,
                                    health: Stats.enemies.Sandstorm[stats[key][0]].health,
                                    mass: Stats.enemies.Sandstorm[stats[key][0]].mass * massDif
                                }
                            },
                            color: statColors.cooldown
                        })
                    }
                } else {
                    if (statColors[key]) {
                        if (key == "mana" && this.type == "Amulet of Time") {
                            this.bottomstats.push({
                                key: "timeMana",
                                value: stats[key],
                                color: Colors.mana.time
                            })
                        } else if (key == "mana" && this.type == "Amulet of Divergence") {
                            this.bottomstats.push({
                                key: "divergenceMana",
                                value: stats[key],
                                color: Colors.mana.divergence
                            })
                        } else if (key == "mana" && this.type == "Amulet of Grace") {
                            this.bottomstats.push({
                                key: "graceMana",
                                value: stats[key],
                                color: Colors.mana.grace
                            })
                        } else if ([
                            "poison",
                            "slowdownTime",
                            "flowerBodyPoison",
                            "summonBodyPoison",
                            "overhealConversion",
                            "period",
                            "extraRange",
                            "waveHealthBoost",
                            "shadowTime",
                            "unrevivable",
                            "healthNerf",
                            "radiusChange",
                            "range",
                            "collectDupeChance",
                            "dropChance",
                            "bodyDamage",
                            "flowerArmor",
                            "armorPercent",
                            "reloadBuff",
                            "maximumMobs",
                            "petLifespan",
                            'healingBoost'
                        ].includes(key)) {
                            this.bottomstats.push({
                                key,
                                value: stats[key],
                                color: statColors[key],
                                unstackable: true
                            })
                        } else if (key == "maxDamage" && ["Shiny Wing", "Shiny Leaf", "Shiny Coral"]) {
                            this.bottomstats.push({
                                key: "maxDamage",
                                value: stats[key] + stats.damage,
                                color: statColors.damage
                            })
                        } else this.bottomstats.push({
                            key,
                            value: stats[key],
                            color: statColors[key]
                        })
                        if (key == "damage") {
                            if (this.type == "Lightning" || this.type == "Blueberries" || this.type == "Shiny Lightning") {
                                this.bottomstats.push({
                                    key: "lightning",
                                    value: stats[key],
                                    color: statColors.lightning
                                })
                            }
                            if (this.type == "Fig") {
                                this.bottomstats.push({
                                    key: "blastDamage",
                                    value: stats[key],
                                    color: statColors.damage
                                })
                            }
                        }
                        if (key == "petLifespan") {

                            if (this.type == "Ruby") {

                                let damage = Stats.rarities[this.rarity].petalDamage

                                let health = 4500 * Stats.rarities[this.rarity].petalHealth

                                this.bottomstats.push({
                                    key: "summon",
                                    value: {
                                        rarity: -1, type: "Rubied Enemy", substats: {
                                            damage,
                                            health,
                                            mass: "Varies"
                                        }
                                    },
                                    color: statColors.cooldown
                                })
                            }
                            if (this.type == "Shiny Ruby") {

                                let damage = (1/6) * Stats.rarities[this.rarity].petalDamage

                                let health = 9000 * Stats.rarities[this.rarity].petalHealth

                                this.bottomstats.push({
                                    key: "summon",
                                    value: {
                                        rarity: -1, type: "Rubied Enemy", substats: {
                                            damage,
                                            health,
                                            mass: "Varies"
                                        }
                                    },
                                    color: statColors.cooldown
                                })
                            }
                        }
                    } else if (key == "spawnRarity") {

                        let massDif = 0.8
                        if (this.rarity <= 13 && (this.type == "Jellyfish Egg" || this.type == "Neuroflare Egg")) { massDif *= 2.25 } else {
                            if (this.rarity >= 14) massDif *= 1.375
                            if (this.rarity == 15 && (this.type == "Jellyfish Egg" || this.type == "Neuroflare Egg")) massDif *= 2.875
                            if (this.rarity >= 16) massDif *= 1.9
                        }

                        if (this.type == "Egg") {
                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Beetle", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 1.5,
                                        health: Stats.enemies.Beetle[stats[key]].health,
                                        mass: Stats.enemies.Beetle[stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Shiny Egg") {
                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Shiny Beetle", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 5,
                                        health: Stats.enemies.Beetle[stats[key]].health,
                                        mass: [Stats.enemies['Shiny Beetle'][stats[key]].mass * massDif * 2, Stats.enemies['Shiny Beetle'][stats[key]].mass * massDif * 2 * 2.5]
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Ant Egg") {

                            let damage = 25 * Stats.rarities[this.rarity].petalDamage
                            if (this.rarity >= 10) damage *= 4 / 5
                            if (this.rarity >= 13) damage *= 5 / 6
                            //if (this.rarity >= 14) damage *= 6.6

                            let health = 2400 * Stats.rarities[this.rarity].petalHealth
                            //if (this.rarity >= 14) health *= 4

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Soldier Ant", substats: {
                                        damage,
                                        health,
                                        mass: Stats.enemies['Soldier Ant'][stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Jellyfish Egg") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Jellyfish", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.5,
                                        health: Stats.enemies.Jellyfish[stats[key]].health,
                                        mass: Stats.enemies.Jellyfish[stats[key]].mass * massDif,
                                        lightning: Stats.enemies.Jellyfish[stats[key]].health * (this.rarity >= 14 ? 0.05 : 0.12),
                                        bounces: stats[key] > 11 ? (stats[key] > 13 ? 4 : 3) : 2
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Neuroflare Egg") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Neuroflare", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 1.2,
                                        health: Stats.enemies.Neuroflare[stats[key]].health,
                                        mass: Stats.enemies.Neuroflare[stats[key]].mass * massDif,
                                        lightning: Stats.enemies.Neuroflare[stats[key]].health * (this.rarity >= 14 ? 0.025 : 0.06),
                                        bounces: stats[key] > 11 ? (stats[key] > 13 ? 4 : 3) : 2
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }

                        if (this.type == "Plastic Egg") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Plastic", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.3,
                                        health: Stats.enemies.Plastic[stats[key]].health,
                                        mass: Stats.enemies.Plastic[stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Square") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Square", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.3,
                                        health: Stats.enemies.Square[stats[key]].health,
                                        mass: Stats.enemies.Square[stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Pentagon") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Pentagon", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.3,
                                        health: Stats.enemies.Pentagon[stats[key]].health,
                                        mass: Stats.enemies.Pentagon[stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Hexagon") {

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Hexagon", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.3,
                                        health: Stats.enemies.Hexagon[stats[key]].health,
                                        mass: Stats.enemies.Hexagon[stats[key]].mass * massDif
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                        if (this.type == "Bubble" && this.rarity >= 13) {

                            let mass = (Stats.enemies.Bubble[stats[key]].mass / 100) * massDif
                            if (this.rarity == 13) mass *= 2;
                            if (this.rarity >= 15) mass *= 2;

                            this.bottomstats.push({
                                key: "summon",
                                value: {
                                    rarity: stats[key], type: "Bubble", substats: {
                                        damage: Stats.rarities[this.rarity].petalDamage * 0.1,
                                        health: Stats.enemies.Bubble[stats[key]].health * 0.01,
                                        mass,
                                        maxEnemyBoost: mass * 1.5
                                    }
                                },
                                color: statColors.cooldown
                            })
                        }
                    } else if (key == "damageHeal") {
                        if (stats[key] > 0) {
                            this.bottomstats.push({
                                key: "lifesteal",
                                value: stats[key],
                                color: statColors.heal
                            })
                        } else if (stats[key] < 0) {
                            this.bottomstats.push({
                                key: "selfDamage",
                                value: -stats[key],
                                color: statColors.damage
                            })
                        }
                    } else if (key == "petalNum") {
                        this.bottomstats.push({
                            key: "mimickedPetals",
                            value: stats[key],
                            color: statColors.extraRange
                        })
                    } else if (key == "shield") {
                        this.bottomstats.push({
                            key,
                            value: formatAmountHighPrecision(stats[key]),
                            color: "#ffffff"
                        })
                    }
                }
            }

            if (!isTs) {
                if ([
                    'Rose',
                    'Dust',
                    'Jolt',
                    'Blood Jolt',
                    'Shell',
                    'Dahlia',
                    'Amulet of Grace',
                    'Shard of Grace',
                ].includes(this.type)) {
                    this.topstats.push({
                        key: 'secondaryReload',
                        value: .32,
                        color: statColors.damage
                    })
                }

                if ([
                    'Missile',
                    'Blade',
                    'Carrot',
                    'Fire Missile',
                    'Homing Missile',
                    "Spore",
                    'Dandelion',
                    'Peas',
                    'Blueberries',
                    'Pomegranate',
                    'Grapes',
                    'Pollen',
                    'Honey',
                    'Neutron Star',
                    'Web',
                    'Lilypad',
                    'Neurotoxin',
                    'Bloodshot Eye'
                ].includes(this.type)) {
                    if ((this.type == "Missile" || this.type == "Fire Missile") && this.rarity == 16) {
                        this.topstats.push({
                            key: 'secondaryReload',
                            value: .05,
                            color: statColors.damage
                        })
                    } else {
                        this.topstats.push({
                            key: 'secondaryReload',
                            value: .5,
                            color: statColors.damage
                        })
                    }
                }


                if ([
                    'Amulet of Divergence',
                    'Shard of Divergence',
                    'Amulet of Time',
                ].includes(this.type)) {
                    this.topstats.push({
                        key: 'secondaryReload',
                        value: 1,
                        color: statColors.damage
                    })
                }

                if ([
                    'Bud',
                    'Bloom',
                    'Thomas'
                ].includes(this.type)) {
                    this.topstats.push({
                        key: 'secondaryReload',
                        value: .2,
                        color: statColors.damage
                    })
                }

                if ([
                    'Ikea',
                ].includes(this.type)) {
                    this.topstats.push({
                        key: 'secondaryReload',
                        value: 2,
                        color: statColors.damage
                    })
                }
            }

            if (this.type == "Trinket of the Wild") {

                let massDif = 0.8

                if (this.rarity >= 14) massDif *= 1.375
                if (this.rarity >= 16) massDif *= 1.5


                let damage = 6.7 * Stats.rarities[this.rarity].petalDamage

                let health = 5500 * Stats.rarities[this.rarity].petalHealth

                this.bottomstats.push({
                    key: "summon",
                    value: {
                        rarity: stats.maximumRarity, type: "Mossy Ruby", substats: {
                            damage,
                            health,
                            mass: Stats.enemies.Ruby[stats.maximumRarity].mass * massDif
                        }
                    },
                    color: statColors.cooldown
                })
            }
            if (this.type == "Trinket of the Hivemind") {

                let massDif = 0.8

                if (this.rarity >= 14) massDif *= 1.375
                if (this.rarity >= 16) massDif *= 1.5

                let damage = 77 * Stats.rarities[this.rarity].petalDamage
                if (this.rarity >= 10) damage *= 4 / 5
                if (this.rarity >= 13) damage *= 5 / 6
                if (this.rarity >= 15) damage *= 1.05

                let health = 7500 * Stats.rarities[this.rarity].petalHealth

                this.bottomstats.push({
                    key: "summon",
                    value: {
                        rarity: stats.maximumRarity, type: "Soldier Termite", substats: {
                            damage,
                            health,
                            mass: Stats.enemies['Soldier Termite'][stats.maximumRarity].mass * massDif
                        }
                    },
                    color: statColors.cooldown
                })
            }
        } else {
            stats = cachedStats.enemies[this.type][this.rarity];

            if (this.type == "Hexagon") this.name = "ӇЄҲƛƓƠƝ";

            if (typeof this.description == "string") {
                let prevT = this.description
                this.description = []
                this.description.push({ text: prevT, color: "#ffffff" });
            }

            this.topstats = [];
            this.bottomstats = [];

            for (let key in stats) {
                if (!isTs && [
                    'tanksmithRadius'
                ].includes(key)) continue;

                if (
                    [
                        "xp"
                    ].includes(key)
                ) {
                    this.topstats.push({
                        key,
                        value: stats[key],
                        color: statColors[key]
                    })
                } else {
                    if (statColors[key]) {
                        this.bottomstats.push({
                            key,
                            value: stats[key],
                            color: statColors[key]
                        })
                        if (key == "damage") if (this.type == "Firefly") {
                            this.bottomstats.push({
                                key: "lightning",
                                value: stats[key] * 0.125,
                                color: statColors.lightning
                            })
                        }
                        if (key == "damage") {
                            if (this.type == "Jellyfish") {
                                this.bottomstats.push({
                                    key: "lightning",
                                    value: stats[key] * 1.5,
                                    color: statColors.lightning
                                })
                            }
                            if (this.type == "Neuroflare") {
                                this.bottomstats.push({
                                    key: "lightning",
                                    value: stats[key] * 0.8,
                                    color: statColors.lightning
                                })
                            }
                            if (this.type == "Electric Eel" || this.type == "Dark Electric Eel" || this.type == "Shiny Electric Eel") {
                                this.bottomstats.push({
                                    key: "lightning",
                                    value: stats[key],
                                    color: statColors.lightning
                                })
                            }
                        }

                        if (key == "health") if (this.type == "Electric Eel" || this.type == "Dark Electric Eel" || this.type == "Shiny Electric Eel") {
                            this.bottomstats.push({
                                key: "lifesteal",
                                value: stats[key] * 0.00125,
                                color: statColors.heal
                            })
                        }
                        if (key == "health") if (this.type == "Leech" || this.type == "BudLeech" || this.type == "Tick") {
                            this.bottomstats.push({
                                key: "lifesteal",
                                value: stats[key] * 0.0025,
                                color: statColors.heal
                            })
                        }
                    } else {
                        if (key == "drops") {
                            this.bottomstats.push({
                                key,
                                value: stats[key],
                                color: "#ffffff"
                            })
                        }

                        if (key == "healing") {
                            this.bottomstats.push({
                                key: "regeneration",
                                value: stats[key] * stats.health * 30,
                                color: statColors.heal
                            })
                        }
                    }
                }
            }
        }
    }
    draw() {
        if (!this.image) {
            let temp = this.generateDesc(300, 500);
            this.w = temp.width;
            this.h = 117.5 + temp.height;
            for (let stat of this.bottomstats) {
                if ((stat.value !== 0 || (stat.value[0] && stat.value[0] !== 0)) && !(this.mode == 'enemies' && stat.key == "detectionDistance" && isNaN(stat.value))) this.h += 17.5;
                if (stat.key == "summon") this.h += 17.5 * ((this.type == "Jellyfish Egg" || this.type == "Neuroflare Egg") ? 5 : (this.type == "Bubble" && this.rarity >= 13) ? 4 : 3);

                if (stat.key == "drops") {
                    let maxDisplay = 0;
                    let invalids = 0;
                    for (let type in stat.value) {
                        if (!Array.isArray(stat.value[type])) {
                            invalids++;
                            continue;
                        }
                        let valid = 0;
                        for (let rarity of stat.value[type]) {
                            if (rarity > 0) valid++
                        }
                        maxDisplay = Math.max(maxDisplay, valid)
                        if (valid == 0) invalids++
                    }

                    this.w = Math.max(25 + maxDisplay * 67.5, this.w)
                    this.h += (Object.keys(stat.value).length - invalids) * 85 + 17.5
                }

                if ([
                    'slowdown',
                    'killBossUnder',
                    'attractionRadius'
                ].includes(stat.key) && stat.value[0]) {
                    let minChange = stat.value[0];
                    let changeV = 0;

                    for (let rarity of stat.value) {
                        if (rarity < 1 || rarity == undefined) continue;
                        if (rarity == minChange) continue;
                        changeV++
                        minChange = rarity
                    }

                    this.h += changeV * 17.5
                }
            }
            if (this.bottomstats.length > 1 && this.mode == 'petals') this.h += 22.5

            this.image = this.mode == "petals" ? this.genPcBox() : this.genEcBox();
            this.is1v1 = is1v1
            this.isTs = isTs
        } else {
            ctx.drawImage(this.image, Math.min(canvas.w - 5 - this.w / 2, Math.max(5, -this.w / 2 + this.x)), Math.min(canvas.h - 5 - this.h, Math.max(5, this.y)))
        }

        if (this.is1v1 !== is1v1 || this.isTs !== isTs) {
            delete this.image
            this.generateData(this.mode, this.type, this.stats)
        }
    }
    genPcBox() {
        const newCanvas = new OffscreenCanvas(this.w, this.h)
        const newCtx = newCanvas.getContext('2d')
        const oldCtx = ctx
        ctx = newCtx

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.fillStyle = "#000000"
        ctx.globalAlpha *= 0.5

        ctx.beginPath();
        ctx.roundRect(0, 0, this.w, this.h, 5)
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha /= 0.5

        ctx.strokeStyle = "#000000"
        ctx.fillStyle = "#ffffff"
        ctx.lineWidth = 2

        ctx.font = `900 ${0.9 * 22.5}px Ubuntu`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'

        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 0.9 * 3.25

        ctx.translate(this.w - 35, 10)
        ctx.drawImage(cachedImages.statics.reloadIcon, 0, 0, 25, 25)

        let text = ``
        let i = 1
        for (let stat of this.topstats) {
            if (stat.key == 'reload') { text += formatAmountHighPrecision(stat.value) + `s` } else
                if (stat.key == 'shootCd') { text += formatAmountHighPrecision(stat.value) + `s` } else
                    if (stat.key == 'lifespan') { text += formatAmountHighPrecision(stat.value) + `s` } else
                        if (stat.key == 'hatchTime') { text += formatAmountHighPrecision(stat.value) + `s` } else
                            if (stat.key == 'timeToPop') { text += formatAmountHighPrecision(stat.value) + `s` } else
                                if (stat.key == 'spawnSystem') { text += formatAmountHighPrecision(stat.value)[1] + `s` } else { text += formatAmountHighPrecision(stat.value) }
            if (this.topstats.length > 1 && i !== this.topstats.length) text += " + "
            i++
        }

        ctx.strokeText(text, -5, 2.5);
        ctx.fillText(text, -5, 2.5);

        ctx.translate(-this.w + 35, 0)

        ctx.font = `900 ${1.2 * 22.5}px Ubuntu`
        ctx.lineWidth = 1.2 * 3.25
        ctx.textAlign = 'left'

        ctx.translate(10, 0);
        ctx.strokeText(this.name, 0, 0);
        ctx.fillText(this.name, 0, 0);

        if (this.amount > 1) {
            let trans = ctx.measureText(this.name).width + 7.5
            ctx.translate(trans, 4)

            ctx.font = `900 ${0.75 * 22.5}px Ubuntu`
            ctx.lineWidth = 0.75 * 3.25

            ctx.strokeText('x' + this.amount.toLocaleString(), 0, 4);
            ctx.fillText('x' + this.amount.toLocaleString(), 0, 4);
            ctx.translate(-trans, -4)
        }

        ctx.font = `900 ${0.75 * 22.5}px Ubuntu`
        ctx.lineWidth = 0.75 * 3.25

        let isUnique = false;
        if (
            (this.type === "Shattered Relic of Wrath" ||
                this.type === "Reinforced Relic of Wrath" ||
                this.type === "Subset Relic of the Guardian" ||
                this.type === "Division Relic of the Guardian" ||
                this.type === "Guard Relic of the Guardian" ||
                this.type === "Knight Relic of the Guardian" ||
                this.type === "Aid Relic of Serenity" ||
                this.type === "Subliminal Relic of Serenity" ||
                this.type === "Barrier Relic of Serenity" ||
                this.type === "Token") && this.rarity == 0
        ) {
            isUnique = true
        }

        ctx.fillStyle = isUnique == true ? "#000000" : Colors.rarities[this.rarity].color

        ctx.translate(0, 30);

        if (this.type == "Hexagon") {

            let text = Colors.rarities[this.rarity].name

            let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

            text = text.toUpperCase()
            let convertexText = ''
            for (let letter of text) {
                convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
            }
            text = convertexText

            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);

        } else {
            ctx.strokeText(isUnique == true ? "???" : Colors.rarities[this.rarity].name, 0, 0);
            ctx.fillText(isUnique == true ? "???" : Colors.rarities[this.rarity].name, 0, 0);
        }

        ctx.font = `900 ${0.7 * 22.5}px Ubuntu`
        ctx.lineWidth = 0.7 * 3.25

        ctx.translate(0, 45);
        for (let row of this.finalDesc) {
            let translate = 0
            for (let text of row) {
                ctx.fillStyle = text.color

                ctx.strokeText(text.text, 0, 0);
                ctx.fillText(text.text, 0, 0);

                ctx.translate(text.written, 0)
                translate += text.written
            }
            ctx.translate(-translate, 22.5);
        }

        ctx.translate(0, 22.5);
        for (let stat of this.bottomstats) {

            if (stat.value == 0) {
                continue;
            }

            ctx.fillStyle = stat.color

            let trans = ctx.measureText(this.formatName(stat.key) + ": ").width

            if (this.type == "Hexagon") {

                let text = this.formatName(stat.key) + ": "

                let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
                let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

                text = text.toUpperCase()
                let convertexText = ''
                for (let letter of text) {
                    convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
                }
                text = convertexText

                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);

                trans = ctx.measureText(text).width
            } else {
                ctx.strokeText(this.formatName(stat.key) + ": ", 0, 0);
                ctx.fillText(this.formatName(stat.key) + ": ", 0, 0);
            }

            ctx.translate(trans, 0);
            ctx.fillStyle = "#ffffff"

            let text = formatAmountHighPrecision(stat.value)

            if ([
                'poison',
                'flowerBodyPoison',
                'summonBodyPoison'
            ].includes(stat.key)) {
                if (this.type == "Shiny Iris") {
                    text = `${formatAmountHighPrecision(stat.value[0])} (${formatAmountHighPrecision(stat.value[1])}/s, total ${Math.round((stat.value[0] / stat.value[1]) * 100) / 100}s per enemy)`
                } else {
                    text = `${formatAmountHighPrecision(stat.value[0])} (${formatAmountHighPrecision(stat.value[1])}/s, total ${Math.round((stat.value[0] / stat.value[1]) * 100) / 100}s)`
                }
            } else if ([
                'cooldown',
                'duration',
                'timeLimit',
                'passiveHealingStackDuration',
                'period',
                'shadowTime',
                'unrevivable',
                'timeToPop',
                'petLifespan',
                'slowdownTime',
                'teleportCooldown',
                'waveSpeed'
            ].includes(stat.key)) {
                text += 's'
            } else if ([
                'overhealConversion',
                'inflation',
                'shinyChanceBoost',
                'damagePercent',
                'dropChance',
                'collectDupeChance',
                'armorPercent',
                'radiusChange',
                'healthNerf',
                'speedBuff'
            ].includes(stat.key)) {
                text += '%'
            } else if ([
                'reloadBuff',
            ].includes(stat.key)) {
                ctx.strokeText(`${stat.value}% (${Math.round(10000 * (1 - ((100 - stat.value) * 0.01) ** 2)) / 100}% on`, 0, 0);
                ctx.fillText(`${stat.value}% (${Math.round(10000 * (1 - ((100 - stat.value) * 0.01) ** 2)) / 100}% on`, 0, 0);

                let t = ctx.measureText(`${stat.value}% (${Math.round(10000 * (1 - ((100 - stat.value) * 0.01) ** 2)) / 100}% on `).width;

                ctx.translate(t, 0);
                ctx.fillStyle = Colors.rarities[this.rarity - 1].color
                ctx.strokeText(Colors.rarities[this.rarity - 1].name, 0, 0);
                ctx.fillText(Colors.rarities[this.rarity - 1].name, 0, 0);

                t = ctx.measureText(Colors.rarities[this.rarity - 1].name).width;

                ctx.translate(t, 0);
                ctx.fillStyle = "#ffffff"
                ctx.strokeText(" & below)", 0, 0);
                ctx.fillText(" & below)", 0, 0);

                ctx.drawImage(cachedImages.statics.noStack, ctx.measureText(" & below)").width + 7.5, -2.5, 20, 20)

                text = ""
            } else if ([
                'damageIncrease',
            ].includes(stat.key)) {
                ctx.strokeText(`${stat.value}% (${stat.value * 1.25}% on `, 0, 0);
                ctx.fillText(`${stat.value}% (${stat.value * 1.25}% on `, 0, 0);

                let t = ctx.measureText(`${stat.value}% (${stat.value * 1.25}% on `).width;

                ctx.translate(t, 0);
                ctx.fillStyle = "#ff0000"
                ctx.strokeText("Blood Petals", 0, 0);
                ctx.fillText("Blood Petals", 0, 0);

                let t2 = ctx.measureText("Blood Petals").width;

                ctx.translate(t2, 0);
                ctx.fillStyle = "#ffffff"
                ctx.strokeText(")", 0, 0);
                ctx.fillText(")", 0, 0);

                ctx.drawImage(cachedImages.statics.noStack, ctx.measureText(")").width + 7.5, -2.5, 20, 20)

                ctx.translate(-(t + t2), 0)
                text = ""
            } else if ([
                'flowerHeal'
            ].includes(stat.key)) {
                ctx.strokeText(`${formatAmountHighPrecision(stat.value)} /s`, 0, 0);
                ctx.fillText(`${formatAmountHighPrecision(stat.value)} /s`, 0, 0);

                let t = ctx.measureText(`${formatAmountHighPrecision(stat.value)} /s`).width;

                ctx.translate(t, 0);
                ctx.drawImage(cachedImages.statics.noStack, ctx.measureText(")").width + 7.5, -2.5, 20, 20)
                ctx.translate(-t, 0)
                text = ""
            } else if ([
                'reviveHealth',
                'healingBoost',
                'healthBuffBoost'
            ].includes(stat.key)) {
                text = formatAmountHighPrecision(stat.value * 100) + '%'
            } else if ([
                'passiveDamagePerKill',
                'passiveHealingBuff',
                'petHeal'
            ].includes(stat.key)) {
                text += '/s'
                if (this.type == "Starfish" || this.type == "Brisingida") text += " (under 70% hp)"
            } else if ([
                'lightning'
            ].includes(stat.key)) {
                if (this.type == "Shiny Lightning") text = "+" + text
                text += '/bounce'
            } else if ([
                'summon'
            ].includes(stat.key)) {
                if (stat.value.rarity > -1) {
                    let name = Colors.rarities[stat.value.rarity].name + " "
                    text = stat.value.type
                    if (stat.value.amount) text += " x" + stat.value.amount

                    if (this.type == "Hexagon") {
                        let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
                        let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

                        name = name.toUpperCase()
                        let convertexText = ''
                        for (let letter of name) {
                            convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
                        }
                        name = convertexText

                        text = text.toUpperCase()
                        convertexText = ''
                        for (let letter of text) {
                            convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
                        }
                        text = convertexText
                    }

                    let t = ctx.measureText(name).width;

                    ctx.fillStyle = Colors.rarities[stat.value.rarity].color
                    ctx.strokeText(name, 0, 0);
                    ctx.fillText(name, 0, 0);

                    ctx.translate(t, 0);
                    ctx.fillStyle = "#ffffff"
                    ctx.strokeText(text, 0, 0);
                    ctx.fillText(text, 0, 0);
                    ctx.translate(-trans - t, 17.5);
                } else {
                    ctx.translate(-trans, 17.5)
                }

                for (let subkey in stat.value.substats) {
                    let subStat = stat.value.substats[subkey]

                    let subText = " - Summon " + this.formatName(subkey) + ": "

                    if (this.type == "Hexagon") {
                        let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
                        let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

                        subText = subText.toUpperCase()
                        let convertexText = ''
                        for (let letter of subText) {
                            convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
                        }
                        subText = convertexText
                    }

                    let x = ctx.measureText(subText).width

                    ctx.fillStyle = statColors[subkey]
                    ctx.strokeText(subText, 0, 0);
                    ctx.fillText(subText, 0, 0);

                    ctx.translate(x, 0);

                    let t = formatAmountHighPrecision(subStat)
                    if (this.type == "Shiny Ruby" && subkey == "damage") t = "+" + t + " (per summon)"
                    if (Array.isArray(t)) t = `${formatAmountHighPrecision(subStat[0])}~${formatAmountHighPrecision(subStat[1])}`

                    ctx.fillStyle = "#ffffff"
                    ctx.strokeText(t, 0, 0);
                    ctx.fillText(t, 0, 0);

                    ctx.translate(-x, 17.5);
                }

                ctx.translate(0, -17.5);
                text = ""
                trans = 0;
            } else if ([
                'slowdown',
                'killBossUnder',
                'attractionRadius'
            ].includes(stat.key) && stat.value[0]) {
                ctx.translate(- trans, 17.5);
                let minChange = stat.value[0], i = -1;
                for (let rarity of stat.value) {
                    i++
                    if (rarity < 1 || rarity == undefined) continue;
                    if (rarity == minChange) continue;

                    minChange = rarity

                    let c = Colors.rarities[i]
                    if (!c) c = Colors.rarities[0]
                    let x = ctx.measureText(`- ${this.formatName(c.name)} ${this.formatName(stat.key)}: `).width

                    ctx.fillStyle = c.color
                    ctx.strokeText(`- ${this.formatName(c.name)} ${this.formatName(stat.key)}: `, 0, 0);
                    ctx.fillText(`- ${this.formatName(c.name)} ${this.formatName(stat.key)}: `, 0, 0);

                    ctx.translate(x, 0);

                    text = formatAmountHighPrecision(stat.value[i])
                    if (stat.key !== "attractionRadius") text += "%"

                    ctx.fillStyle = "#ffffff"
                    ctx.strokeText(text, 0, 0);
                    ctx.fillText(text, 0, 0);

                    ctx.translate(-x, 17.5);
                }

                ctx.translate(0, -17.5);
                text = ""
                trans = 0;
            } else if (this.type == "Plank" && stat.key == "damage") {
                ctx.strokeText(`${formatAmountHighPrecision(stat.value)} (${formatAmountHighPrecision(stat.value * 1000)} against projectiles)`, 0, 0);
                ctx.fillText(`${formatAmountHighPrecision(stat.value)} (${formatAmountHighPrecision(stat.value * 1000)} against projectiles)`, 0, 0);
            } else if ([
                'rotateSpeedBuff'
            ].includes(stat.key)) {
                text += ' radians/s'
            } else if ([
                'maxSkip'
            ].includes(stat.key)) {
                text += ' waves'
            } else {
                ctx.strokeText(formatAmountHighPrecision(stat.value), 0, 0);
                ctx.fillText(formatAmountHighPrecision(stat.value), 0, 0);
            }

            if (text !== "") {
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            }

            if (stat.unstackable && text !== "" && cachedImages.statics.noStack) ctx.drawImage(cachedImages.statics.noStack, ctx.measureText(text).width + 7.5, -2.5, 20, 20)

            ctx.translate(-trans, 17.5);
        }

        ctx = oldCtx
        return newCanvas
    }
    genEcBox() {
        const newCanvas = new OffscreenCanvas(this.w, this.h)
        const newCtx = newCanvas.getContext('2d')
        const oldCtx = ctx
        ctx = newCtx

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.fillStyle = "#000000"
        ctx.globalAlpha *= 0.5

        ctx.beginPath();
        ctx.roundRect(0, 0, this.w, this.h, 5)
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha /= 0.5

        ctx.strokeStyle = "#000000"
        ctx.fillStyle = "#ffffff"
        ctx.lineWidth = 2

        ctx.font = `900 ${0.9 * 22.5}px Ubuntu`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'

        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 0.9 * 3.25

        ctx.translate(this.w - 35, 10)
        ctx.drawImage(cachedImages.statics.xp, 0, 0, 25, 25)

        let text = ``
        let i = 1
        for (let stat of this.topstats) {
            if (stat.key == 'temp') { text += stat.value[1] + `s` } else { text += formatAmountHighPrecision(stat.value) }
            if (this.topstats.length > 1 && i !== this.topstats.length) text += " + "
            i++
        }

        ctx.strokeText(text, -5, 2.5);
        ctx.fillText(text, -5, 2.5);

        ctx.translate(-this.w + 35, 0)

        ctx.font = `900 ${1.2 * 22.5}px Ubuntu`
        ctx.lineWidth = 1.2 * 3.25
        ctx.textAlign = 'left'

        ctx.translate(10, 0);
        ctx.strokeText(this.name, 0, 0);
        ctx.fillText(this.name, 0, 0);

        ctx.font = `900 ${0.75 * 22.5}px Ubuntu`
        ctx.lineWidth = 0.75 * 3.25

        ctx.fillStyle = Colors.rarities[this.rarity].color

        ctx.translate(0, 30);
        if (this.type == "Hexagon") {

            let text = Colors.rarities[this.rarity].name

            let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

            text = text.toUpperCase()
            let convertexText = ''
            for (let letter of text) {
                convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
            }
            text = convertexText

            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);

        } else {
            ctx.strokeText(Colors.rarities[this.rarity].name, 0, 0);
            ctx.fillText(Colors.rarities[this.rarity].name, 0, 0);
        }

        ctx.font = `900 ${0.7 * 22.5}px Ubuntu`
        ctx.lineWidth = 0.7 * 3.25

        ctx.translate(0, 45);
        for (let row of this.finalDesc) {
            let translate = 0
            for (let text of row) {
                ctx.fillStyle = text.color
                ctx.strokeText(text.text, 0, 0);
                ctx.fillText(text.text, 0, 0);

                ctx.translate(text.written, 0)
                translate += text.written
            }
            ctx.translate(-translate, 22.5);
        }

        ctx.translate(0, 22.5);
        for (let stat of this.bottomstats) {

            if (stat.key !== "drops") {
                if (stat.value == 0 || (stat.key == "detectionDistance" && isNaN(stat.value))) {
                    continue;
                }

                ctx.fillStyle = stat.color

                let trans = ctx.measureText(this.formatName(stat.key) + ": ").width

                if (this.type == "Hexagon") {

                    let text = this.formatName(stat.key) + ": "

                    let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
                    let b = 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ'.split('')

                    text = text.toUpperCase()
                    let convertexText = ''
                    for (let letter of text) {
                        convertexText += b[a.indexOf(letter)] ? b[a.indexOf(letter)] : letter
                    }
                    text = convertexText

                    ctx.strokeText(text, 0, 0);
                    ctx.fillText(text, 0, 0);

                    trans = ctx.measureText(text).width
                } else {
                    ctx.strokeText(this.formatName(stat.key) + ": ", 0, 0);
                    ctx.fillText(this.formatName(stat.key) + ": ", 0, 0);
                }

                ctx.translate(trans, 0);
                ctx.fillStyle = "#ffffff"

                let text = formatAmountHighPrecision(stat.value)

                if ([
                    'lightning'
                ].includes(stat.key)) {
                    text += (this.type == "Electric Eel" || this.type == "Dark Electric Eel" || this.type == "Shiny Electric Eel") ? '/s' : '/bounce'
                } else if ([
                    'healingReduction'
                ].includes(stat.key)) {
                    text = stat.value * 100 + '%/hit'
                } else if ([
                    'regeneration',
                    'lifesteal'
                ].includes(stat.key)) {
                    text += '/s'
                } else if ([
                    'poison',
                    'flowerBodyPoison',
                    'summonBodyPoison'
                ].includes(stat.key)) {
                    text = `${formatAmountHighPrecision(stat.value[0])} (${formatAmountHighPrecision(stat.value[1])}/s, total ${Math.round((stat.value[0] / stat.value[1]) * 100) / 100}s)`
                } else {
                    ctx.strokeText(formatAmountHighPrecision(stat.value), 0, 0);
                    ctx.fillText(formatAmountHighPrecision(stat.value), 0, 0);
                }

                if (text !== "") {
                    ctx.strokeText(text, 0, 0);
                    ctx.fillText(text, 0, 0);
                }

                ctx.translate(-trans, 17.5);
            } else {

                for (let row in stat.value) {
                    let drops = stat.value[row]

                    let t = 0;
                    let valid = 0;
                    for (let rarity in drops) {
                        let drop = drops[rarity]
                        if (drop == 0) continue
                        valid++

                        let p = new Petal({ type: row });
                        let pc = new PetalContainer([p], { x: 27.5, y: 42.5, w: 50, h: 50, toOscillate: false }, 0, 1, 0);
                        pc.render.w = 50;
                        pc.spawnAnimation = 1;
                        pc.rarity = rarity;
                        if (Stats.specialRarityDrops[this.rarity]) {
                            for (let special of Stats.specialRarityDrops[this.rarity]) {
                                if (pc.rarity == special.originalRarity && !pc.modified) {
                                    if (special.replaceRarity) pc.rarity = special.replaceRarity;
                                    pc.amount = special.amount;
                                    pc.modified = true;
                                }
                            }
                        }

                        ctx.font = `900 ${0.7 * 22.5}px Ubuntu`
                        ctx.lineWidth = 0.7 * 3.25

                        ctx.fillStyle = "white"
                        ctx.strokeStyle = "black"

                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'

                        if (drop < 0.01) {
                            //drop
                        } else {
                            drop = formatAmountHighPrecision(drop)
                        }

                        ctx.strokeText(drop + "%", 27.5, 85);
                        ctx.fillText(drop + "%", 27.5, 85);

                        pc.draw()
                        ctx.translate(67.5, 0)
                        t += 67.5
                    }

                    if (valid > 0) ctx.translate(-t, 85)
                }
            }
        }

        ctx = oldCtx
        return newCanvas
    }
    generateDesc(min, max) {
        ctx.font = `900 ${0.7 * 22.5}px Ubuntu`

        if (this.mode == 'petal') {
            if (this.amount > 1) {
                max += ctx.measureText(this.amount.toLocaleString()).width + 7.5
            }

            min += ctx.measureText(this.amount.toLocaleString()).width + 7.5
        }

        let texts = [],
            finalDesc = [],
            finalLength = {
                current: 0, max: 0, writing: 0
            },
            row = 0,
            unfinished = { text: "", color: "#ffffff" },
            index = 0;
        for (let text of this.description) {
            let temp = text.text.split(" ")

            for (let subtext of temp) {
                texts.push({ text: subtext, color: text.color })
            }
        }

        for (let text of texts) {
            let length = ctx.measureText(text.text + " ").width;

            if (finalLength.current + length > max - 15) {
                finalDesc[row].push({ text: unfinished.text, color: unfinished.color, written: finalLength.writing })
                row++;
                finalLength.current = 0;
                finalLength.writing = 0;
                unfinished = { text: "", color: text.color }
            }
            if (!finalDesc[row]) {
                finalDesc[row] = []
            }

            if (unfinished.color !== text.color) {
                finalDesc[row].push({ text: unfinished.text, color: unfinished.color, written: finalLength.writing });
                finalLength.writing = 0;
                unfinished = { text: "", color: text.color }
            }

            if (index !== texts.length - 1) {
                unfinished.text += text.text + " "
            } else {
                unfinished.text += text.text
                finalDesc[row].push({ text: unfinished.text, color: unfinished.color, written: finalLength.writing })
            }

            finalLength.current += length
            finalLength.writing += length
            finalLength.max = Math.max(finalLength.max, finalLength.current)
            index++
        }

        this.finalDesc = finalDesc

        return { width: Math.max(min, finalLength.max) + 15, height: (finalDesc.length - 1) * 22.5 }
    }
    formatName(name) {
        if (name.length > 1) {
            name = name[0].toUpperCase() + name.slice(1);
        }

        for (let i = 0; i < name.length; i++) {
            if (name[i].toUpperCase() === name[i]) {
                if (i == 0) {
                    name = name.slice(0, i) + name[i].toUpperCase() + name.slice(i + 1);
                } else {
                    name = name.slice(0, i) + ' ' + name[i].toUpperCase() + name.slice(i + 1);
                }
                i += 2;
            }
        }

        return name;
    }
}

// const testBox = generateStatsBox({
//     "petals": [
//         {
//             "x": 0,
//             "y": 0,
//             "angle": 0,
//             "radius": 10,
//             "type": "Salt",
//             "rarity": 3,
//             "damage": 29,
//             "offset": {
//                 "angle": 0,
//                 "distance": 0
//             },
//             "distance": 0,
//             "dv": 0,
//             "id": 0,
//             "subId": 0,
//             "subStackedId": 0,
//             "dead": false,
//             "hp": 19,
//             "maxHp": 19,
//             "reload": 2.5,
//             "maxReload": 2.5,
//             "angleOffset": 0,
//             "render": {
//                 "distance": 0,
//                 "angle": 0,
//                 "x": 0,
//                 "y": 0
//             },
//             "selfAngle": 0,
//             "dying": false,
//             "deadAnimationTimer": 9999,
//             "ticksSinceLastDamaged": 9999,
//             "insidePetalContainer": true,
//             "isProjectile": false
//         }
//     ],
//     "petalStats": {
//         "radius": 10,
//         "knockback": 0.1,
//         "damage": 29,
//         "health": 19,
//         "maxDamage": 23.2,
//         "salt": 20.833333333333336,
//         "reload": 2.5,
//         "petalLayout": [
//             [
//                 {}
//             ]
//         ],
//         "override": {
//             "1": {
//                 "salt": 8.333333333333334
//             },
//             "2": {
//                 "salt": 13.333333333333334
//             },
//             "3": {
//                 "salt": 20.833333333333336
//             },
//             "4": {
//                 "salt": 31.666666666666668
//             },
//             "5": {
//                 "salt": 45.833333333333336
//             },
//             "6": {
//                 "salt": 62.5
//             },
//             "7": {
//                 "salt": 91.66666666666667
//             },
//             "8": {
//                 "salt": 183.33333333333334
//             }
//         },
//         "damageScalers": [
//             "damage",
//             "maxDamage"
//         ],
//         "healthScalers": [
//             "health"
//         ]
//     },
//     "rarity": 3,
//     "type": "Salt",
//     "x": 0,
//     "y": 0,
//     "w": 62,
//     "h": 62,
//     "radius": 50,
//     "render": {
//         "x": 0,
//         "y": 0,
//         "w": 65
//     },
//     "amount": 100017,
//     "attempt": 15,
//     "id": 0.24452447930549015,
//     "spawnAnimation": 0,
//     "lastAmountChangedTime": -1000,
//     "collectTime": null,
//     "toOscillate": false,
//     "creationTime": 1315.6999999284744,
//     "isDraggingPetalContainer": false
// }, true, {x: 120, y: 160})

const statColors = {
    damage: '#ff4444',
    health: '#44ff44',
    reload: '#44ddff',
    cooldown: '#67dbad',
    tanksmithRechargeTime: '#44ddff',
    shootCooldown: '#44ddff',
    speed: '#44ddff',
    tanksmithRadius: '#e044ff',
    tanksmithHealth: '#44ff44',
    poison: '#e644ff',
    summonBodyPoison: '#ec73ff',
    flowerBodyPoison: '#b33fc5',
    attractionRadius: '#baa052',
    salt: '#ff4444',//'#a1bec4',
    bodyDamage: '#de3380',
    shinyChanceBoost: '#f5e042',
    maxDamage: '#ff4444',
    slowdown: '#777777',
    slowdownTime: '#b172cf',
    armor: '#838383',
    mass: '#696969',
    duration: '#ff44ee',
    heal: '#ff94c9',
    petHeal: '#c96d9b',
    flowerHeal: "#fc65b0",
    xp: '#f9ff44',
    detectionDistance: '#ffb144',
    extraRange: '#1585b5',
    wingExtraRange: '#1585b5',
    enemyKnockback: '#de823f',
    healAmount: '#44ff44',
    healDelay: '#44ff44',
    range: '#e00030',
    period: '#e3c59d',
    damagePercent: '#e3c59d',
    bounces: '#a7faef',
    healthNerf: '#eb7faf',
    overhealConversion: '#dae09f',
    hatchTime: '#9fd49f',
    extraDamage: '#ffbb00',
    criticalDamage: "#dd0000",
    flowerArmor: '#a3a3a3',
    maxEnemyBoost: '#33dd33',
    petLifespan: "#999999",
    lifespan: "#499999",
    reviveHealth: "#944994",
    maximumWave: "#009930",
    timeToPop: "#ffeeaa",
    shadowTime: "#333333",
    unrevivable: "#555555",
    damageConversion: "#aaaaaa",
    maximumMobs: "#9055cf",
    healingReduction: "#dddddd",
    reloadBuff: "#42e38a",
    useLimit: "#4d7896",
    wavesSentBack: "#445396",
    effect: "#b0b0b0",
    passiveDamagePerKill: "#ff3344",
    radiusChange: "#4986e3",
    passiveHealingStack: "#35de3e",
    passiveHealingStackDuration: "#659c68",
    killsRequired: "#ff1234",
    timeLimit: "#3582ab",
    failDamage: "#bf245b",
    blastRadius: "#56269e",
    armorPercent: "#7d9c7b",
    finalHitDamage: "#ff5900",
    hitBlastRadius: "#e4aa40ff",
    hitBlastDamage: "#cf601fff",
    dropChance: "#af03bd",
    collectDupeChance: "#af56cb",
    teleportCooldown: "#70bcd4",
    inflation: "#d4d4d4",
    shootCooldownBuff: "#ff9944",
    projectileSpeedBuff: "#ff9944",
    speedBuff: "#fafafa",
    knockbackMass: '#d4d4d4',
    bodyKnockback: '#d4d4d4',
    mana: "#ffffff",
    waveSpawningSpeed: "#a4ffa4",
    healingBoost: '#f8464d',
    healthBuff: "#35de3e",
    healthBuffBoost: "#4eb648ff",
    waveHealthBoost: "#35de3e",
    killBossUnder: "#dd4433",
    passiveHealingBuff: "#ff94c9",
    lightning: "#29f2e5",
    teleportCooldown: "#70bcd4",
    damageIncrease: "#8b3ae0",
    rotateSpeedBuff: "#9cee56",
    maxWave: "#df3a83",
    maxSkip: "#d6709d",
    waveSpeed: "#c5628dff"
}

for (let i in (Colors.rarities)) {
    statColors[Colors.rarities[i].name] = Colors.rarities[i].color;
}

const enemyRarityScalars = [{// NOTE: DO NOT CHANGE ANY OF THESE. THEY WERE SUPPOSED TO BE FINAL.
    // IF YOU DO CHANGE THEM PLEASE UPDATE THEM CLIENT SIDE SO THAT STATS ARE ACCURATE
    name: "Common",
    health: 1,
    damage: 1,
    radius: 1,
    mass: 1,
    petalDamage: 1,
    petalHealth: 1,
    petalHeal: 1,
    petalMass: 1,
    detectionDistance: 1,
    xp: 1
}, {
    name: "Unusual",
    health: 2,
    damage: 1.2,
    radius: 1.1,
    mass: 1.52,
    petalDamage: 1.4,
    petalHealth: 1.2,
    petalHeal: 1.51,
    petalMass: 1.52,
    detectionDistance: 1.1,
    xp: 3
}, {
    name: "Rare",
    health: 4,
    damage: 1.5,
    radius: 1.3,
    mass: 2.46,
    petalDamage: 2,
    petalHealth: 1.5,
    petalHeal: 2.23,
    petalMass: 2.46,
    detectionDistance: 1.2,
    xp: 9
}, {
    name: "Epic",
    health: 8 * 1.72 / 1.6,
    damage: 1.9,
    radius: 1.72,//1.6, 
    mass: 5.7,
    petalDamage: 2.9,
    petalHealth: 1.9,
    petalHeal: 3.17,
    petalMass: 5.7,
    detectionDistance: 1.3,
    xp: 27
}, {
    name: "Legendary",
    health: 50,
    damage: 2.7,
    radius: 3,
    mass: 18.6,
    petalDamage: 4.8,
    petalHealth: 2.7,
    petalHeal: 4.94,
    petalMass: 18.6,
    detectionDistance: 1.7,
    xp: 81
}, {
    name: "Mythic",
    health: 110,
    damage: 4.3,
    radius: 5,
    mass: 43,
    petalDamage: 9.7,//9.1
    petalHealth: 4.3,
    petalHeal: 10.2,
    petalMass: 43,
    detectionDistance: 2.1,
    xp: 243
}, {
    name: "Ultra",
    health: 310,
    damage: 8.6,
    radius: 7,
    mass: 100,
    petalDamage: 23,//18.3
    petalHealth: 8.6,
    petalHeal: 21.45,
    petalMass: 100,
    detectionDistance: 2.5,
    xp: 729
}, {
    name: "Super",
    health: 1350,
    damage: 17.2,
    radius: 9.5,
    mass: 216,
    petalDamage: 90,
    petalHealth: 17.2,
    petalHeal: 40.3,
    petalMass: 216,
    detectionDistance: 2.5,
    xp: 2187
}, {
    name: "Omega",
    health: 4941,
    damage: 34.4,
    radius: 13,
    mass: 500,
    petalDamage: 315,
    petalHealth: 34.4,
    petalHeal: 74,
    petalMass: 500,
    detectionDistance: 2.5,
    xp: 6561
}, {
    name: "Fabled",
    health: 18084,
    damage: 68.8,
    radius: 17.7,
    mass: 1250,
    petalDamage: 1100,
    petalHealth: 68.8,
    petalHeal: 140.6,
    petalMass: 1250,
    detectionDistance: 2.5,
    xp: 40000
}, {
    name: "Divine",
    health: 66188,
    damage: 137.6,
    radius: 24.1,
    mass: 3125,
    petalDamage: 3850,
    petalHealth: 137.6,
    petalHeal: 267.14,
    petalMass: 3125,
    detectionDistance: 2.5,
    xp: 300000
}, {
    name: "Supreme",
    health: 242247,
    damage: 275.2,
    radius: 33,
    mass: 9375,
    petalDamage: 13475,
    petalHealth: 275.2,
    petalHeal: 507,
    petalMass: 9375,
    detectionDistance: 2.5,
    xp: 3e6
}, {
    name: "Omnipotent",
    health: 968988,
    damage: 550,
    radius: 45,
    mass: 33750,
    petalDamage: 47162.5,
    petalHealth: 550,
    petalHeal: 963,
    petalMass: 33750,
    detectionDistance: 2.5,
    xp: 3e7
}, {

    name: "Astral",
    health: 4844940,
    damage: 1100,
    radius: 62,
    mass: 194400,
    petalDamage: 264115,
    petalHealth: 1650,
    petalHeal: 2889,
    petalMass: 194400,
    detectionDistance: 2.5,
    xp: 5e8
}, {

    name: "Celestial",
    health: 9800000,
    damage: 1650,
    radius: 71,
    mass: 388800,
    petalDamage: 2667561,
    petalHealth: 9900,
    petalHeal: 9625,
    petalMass: 2300000,
    detectionDistance: 2.5,
    xp: 1e10
}, {

    name: "Seraphic",
    health: 20000000,
    damage: 2475,
    radius: 81,
    mass: 777600,
    petalDamage: 26945000,
    petalHealth: 59400,
    petalHeal: 57750,
    petalMass: 27600000,
    detectionDistance: 2.5,
    xp: 3e11
}, {

    name: "Transcendent",
    health: 60000000,
    damage: 4950,
    radius: 103,
    mass: 2300000,
    petalDamage: 269450000,
    petalHealth: 267300,
    petalHeal: 210000,
    petalMass: 38400000,
    detectionDistance: 3.25,
    xp: 9e12
}, {
      
      name: "Ethereal",
      health: 120000000,
      damage: 7425,
      radius: 118, 
      mass: 4600000,  
      petalDamage: 3000000000, 
      petalHealth: 1603800,
      petalHeal: 882000,
      petalMass: 4608000000,
      detectionDistance: 3.25,
      xp: 27e13
    }, {

    name: "Galactic",
    health: 360000000,
    damage: 14850,
    radius: 135,
    mass: 13800000,
    petalDamage: 33000000000, 
    petalHealth: 9622800,
    petalHeal: 3704400,
    petalMass: 55296000000,
    detectionDistance: 3.25,
    xp: 81e14
},
{
    name: "Eternal",
    health: 720000000,
    damage: 21000,
    radius: 154,
    mass: 27600000,
    petalDamage: 363000000000,
    petalHealth: 57736800,
    petalHeal: 15558480,
    petalMass: 663552000000,
    detectionDistance: 3.25,
    xp: 243e15
},
{
    name: "Apotheotic",
    health: 1440000000,
    damage: 29700,
    radius: 175,
    mass: 55200000,
    petalDamage: 4e12, 
    petalHealth: 346420800,
    petalHeal: 65345616,
    petalMass: 7.96e12,
    detectionDistance: 3.25,
    xp: 7e18
},
{
    name: "Voidbound",
    health: 4.32e9,
    damage: 59400,
    radius: 200,
    mass: 1.6e8,
    petalDamage: 1.87e9,
    petalHealth: 281600,
    petalHeal: 320000,
    petalMass: 19200000,
    detectionDistance: 3.3,
    xp: 2e20
},
{
    name: "Exalted",
    health: 8.64e9,
    damage: 89100,
    radius: 228,
    mass: 3.2e8,
    petalDamage: 3.6e9,
    petalHealth: 563200,
    petalHeal: 640000,
    petalMass: 38400000,
    detectionDistance: 3.35,
    xp: 6e21
},
{
    name: "Chaos",
    health: 1.728e10,
    damage: 133650,
    radius: 258,
    mass: 6.4e8,
    petalDamage: 7.2e9,
    petalHealth: 1126400,
    petalHeal: 1280000,
    petalMass: 76800000,
    detectionDistance: 3.4,
    xp: 18e22
},
{
    name: "Cataclysmic",
    health: 4.5e10,
    damage: 267300,
    radius: 295,
    mass: 2e9,
    petalDamage: 14.4e9,
    petalHealth: 2252800,
    petalHeal: 2560000,
    petalMass: 153600000,
    detectionDistance: 3.45,
    xp: 6e24
},
{
    name: "Nullborne",
    health: 11e10,
    damage: 534600,
    radius: 335,
    mass: 6e9,
    petalDamage: 28.8e9,
    petalHealth: 4505600,
    petalHeal: 5120000,
    petalMass: 460000000,
    detectionDistance: 3.5,
    xp: 1.8e26
},
{
			name: "Eclipsed",
      health: 2.2e11,
      damage: 1069200,
      radius: 380, 
      mass: 12e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 5.4e27
    },
		{
			name: "Radiant",
      health: 4.4e11,
      damage: 1603800,
      radius: 431, 
      mass: 24e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 1.62e29
    },
		{
			name: "Forsaken",
      health: 1.14e12,
      damage: 3207600,
      radius: 489, 
      mass: 72e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 4.86e30
    },
		{
			name: "Chromatic",
      health: 2.9e12,
      damage: 6415200,
      radius: 555, 
      mass: 144e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 14.58e31
    },
		{
			name: "Prismatic",
      health: 5.8e12,
      damage: 9622800,
      radius: 630, 
      mass: 288e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 43.76e32
    },
		{
			name: "Arcane",
      health: 13.9e12,
      damage: 19245600,
      radius: 715, 
      mass: 864e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 130e33
    },
		{
			name: "Esoteric",
      health: 34e12,
      damage: 38491200,
      radius: 811, 
      mass: 1788e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 390e34
    },
    {
			name: "Metaphysical",
      health: 68e12,
      damage: 57736800,
      radius: 921, 
      mass: 3576e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 1.17e38
    },
		{
			name: "Primordial",
      health: 156e12,
      damage: 115473600,
      radius: 1046, 
      mass: 10728e9,
      petalDamage: 1e15, 
      petalHealth: 1e12,
      petalHeal: 1e12,
      petalMass: 1e15,
      detectionDistance: 3.5,
      xp: 3.51e39
    },
];
// for(let key in statColors){
//     statColors[key] = blendColor(statColors[key], '#cccccc', 0.18);
// }
