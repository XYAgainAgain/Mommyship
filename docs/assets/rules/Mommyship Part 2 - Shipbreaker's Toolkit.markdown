<img src="Assets/Art/MothershipSplash0.webp" alt="Mothership original splash art" class="splash-banner">

# MOMMYSHIP

**A HOMEBREW TABLE RULESET** for **MOTHERSHIP SCI-FI HORROR RPG**

## SHIPBREAKER'S TOOLKIT

***CONTENT WARNING***

Mommyship is a horror game for mature audiences. It contains violence, foul language, body horror, some sexual content, drug use, and depictions of mental illness, trauma, stress, panic, and capitalistic abuse which may not be suitable for all audiences. Please be advised.

***SYSTEM CHANGES***

Mommyship differs from [Mothership](https://www.tuesdayknightgames.com/pages/mothership-rpg)® in several notable ways — changing how Hull and Megadamage work, adding multiple Ship Roles to synergize with whatever spacers you have, adding new Ship Upgrades, Hardpoints, and Amenities, and generally rebalancing expenses associated with running a ship and its crew.

It also introduces an expenses calculator for modularly creating ships and calculating the costs of used vessels.

### 1.0 SHIPS & SPACE TRAVEL

Whether you're crawling through the ducts of a derelict, probing the interior of an unknown vessel, or sipping day-old coffee in the galley of a beat-up freighter, you spend the majority of your time in Mommyship aboard spacecraft.

#### 1.1 HOW A SHIP WORKS

Ships can make Stat Checks just like a character. However, whenever a ship fails a Stat Check, **everyone on board** must make a Fear Save. As with all Stat Checks, a roll of 90–99 is always considered a failure.

Your ship has three main Stats which represent its capabilities when acting under extreme pressure:

- **Thrusters:** Safely maneuvering and accelerating in space.
- **Battle:** Targeting and attacking other spacecraft in ship-to-ship combat.
- **Systems:** Utilizing your ship's sensors, computers, maintenance, and other subsystems.

##### *1.1.1 PARTS OF A SHIP*

In addition to these Ship Stats, vessels also typically have a number of other parts and functions you'll need to be aware of:

- **Transponder:** Your Transponder is an automated radio system that broadcasts important information about your ship. In most star systems, it is illegal (or highly suspect) to turn this off.
- **Hull:** Your ship's Armor — this functions the same as a character's Armor Points, and represents how much Damage your ship can withstand before things start to go wrong. Your ship will have a Maximum Hull value, and you will need to track the current amount of Hull as you take attacks and sustain Damage. No ship can have more than 9 Maximum Hull.
- **Fuel:** Your ship spends 1 unit of Fuel each month it travels, and 1 Warp Core each time it jumps through Hyperspace. Your ship will have a Maximum Fuel amount it can store in its tanks, and you will need to track the current amount of Fuel available as it is expended.
- **Crew:** Your ship's life support systems can only support a certain number of biological crew, and its power systems can only support charging a certain number of mechanical crew, so it will have a maximum crew capacity which represents the combined limit of both these systems.
- **Cryopods:** The number of available Cryopods, used to store & protect biological crew on long journeys or while awaiting aid in the void of space.
- **Escape Pods:** The number of available escape pods, in case the ship experiences a catastrophic failure.
- **Cargo:** How much stuff your ship can hold. One unit of cargo is equivalent to a 6×6×6m (20×20×20ft.) cube.
- **Passengers:** If you need to take on people beyond the maximum Crew, some ships have auxiliary systems that allow you to take on Passengers.
- **Upgrades:** Depending on its size and type, ships will have a number of open slots for upgrade modules to be installed. For more information, see [Upgrades [1.3]](#1.3.1-upgrades)
- **Hardpoints:** Depending on its size and type, ships will have a number of available Hardpoints where Weapons can be installed.
- **Weapons:** Big guns, installed on Hardpoints to improve your ship's Battle.
- **Megadamage (MDMG):** Ships deal a special type of Damage called Megadamage, which is Damage and wounds rolled into one. This is determined by your ship's class and modified by Weapons.

###### *SHIP DECKPLAN ICONS*

These icons can be found on maps of vessels of all kinds, indicating certain facilities, functions, and features. These are not necessarily galactically-recognized symbols, but for the sake of play, it's safe to assume everybody knows what these mean.

<img src="Assets/Sheets/DECKPLAN-LIGHT.jpg" alt="Ship Deckplan Icons" class="theme-img-light">
<img src="Assets/Sheets/DECKPLAN-DARK.jpg" alt="Ship Deckplan Icons" class="theme-img-dark">

##### *1.1.2 ROLES ON A SHIP*

Ships don't fly themselves (at least, not always). Crewing a ship requires at least ¼ its base maximum Crew capacity before Upgrades, rounded up (minimum 1), and it must have a **Captain**. Each Role can only be filled by one character at a time, regardless of ship size or Class. There are benefits to running with a fuller crew, however — Crewmembers can inhabit Roles on the ship, conferring their Skills to certain rolls or granting additional benefits to running the ship. If someone aboard the ship meets no prerequisites, they are usually considered a Passenger (or potential Acting Captain).

| ROLE | PREREQ. | DESCRIPTION |
| :---: | :---: | :---: |
| **CAPTAIN** | None but gumption | Adds their Influence or Command Skill to ship Morale Checks. |
| **PILOT** | Piloting or Hyperspace | Adds their Piloting or Hyperspace Skill to Thrusters Checks. |
| **X.O.** | Influence, Military Training, Psychology, or Command | Can grant [+] to any Crewmember on any Check within Close Range. |
| **ENGINEER** | Mechanical Repair or Engineering | Adds their Mechanical Repair or Engineering Skill to Systems Checks. |
| **GUNNER** | Military Training, Firearms, or Artillery | Adds their Military Training, Firearms, or Artillery Skill to Battle Checks. |
| **DOCTOR** | First Aid, Field Medicine, or Surgery | Can restore 1d5 Wounds per month for anyone aboard the ship. The number rolled equals the total amount of Wounds they can restore across all crew. |
| **LIAISON** | Linguistics or Influence | Adds their Linguistics or Influence Skill to any rolls required for communication between ships and ports. |
| **CUSTODIAN** | Jury-Rigging or Rimwise | [+] on all Maintenance Checks. |
| **COOK** | Botany, Chemistry, or Zoology | Can give the crew [+] on a Rest Save when they have prepared a home-cooked meal during that rest period. |
| **ACCOUNTANT** | Mathematics, Computers, or Rimwise | [+] on all Bankruptcy and Debt Checks. |
| **COUNSELOR** | Art, Theology, or Psychology | [+] on Panic Checks when Crewmembers and the Counselor are both onboard. |
| **GARDENER** | Botany, Ecology, Exobiology, or Planetology | [+] on Sanity Saves when Crewmembers and the Gardener are both onboard. |

Both player characters and Contractors can be assigned a Role, as long as they have the Prerequisite Skills. Assigning a Contractor to a **Liaison**, **Custodian**, **Cook**, or **Accountant** Role increases their Salary by 500cr and adds +1 to their Loyalty. Contractors assigned to any other Role increase their Salary by 1kcr and add +2 to their Loyalty.

###### *1.1.2.1 YOUR SALARY*

Player character Crewmember Salaries are calculated from their Stats, Skills, Wounds, and assigned Ship Role. Only actual learned Skills count toward Salary calculations; bonuses from Patches or similar equipment do not. The Captain or X.O. may dole out bonuses as they see fit (such as Hazard Pay). To determine a character's standard monthly Salary:

1. **Physical Ability:** Take the higher of **Speed or Strength** and multiply it by **20**.
2. **Technical/Social Ability:** Take the higher of **Smarts or Savvy** and multiply it by **30**.
3. **Durability:** Multiply your character's **Maximum Wounds** by **750**.
4. **Training:** Add…
    1. **300** for each Trained Skill.
    2. **600** for each Expert Skill.
    3. **900** for each Master Skill.
5. **Ship Role:** Add the Salary Bonus (listed above) for your assigned Ship Role, if any.
6. **Add everything together.** The result is your **Monthly Salary** in credits.

It's wise to run the numbers at character creation so you know your worth from the jump. If you prefer to use an actual formula:

**Monthly Salary** = (max(SPD, STR) × 20) + (max(SMT, SVY) × 30) + (Max Wounds × 750) + (Trained Skills × 300) + (Expert Skills × 600) + (Master Skills × 900) + Ship Role Bonus

##### *1.1.3 THE SHIP MANIFEST*

Much like a character sheet, the Ship's Manifest helps you keep track of your ship's status and other resources.

#### 1.2 SHIP CLASSIFICATIONS

Ships come in all shapes and sizes, and are built and modified to all sorts of purposes. The primary designations used to refer to a ship are its **Jump Rating** and its **Class.**

The Jump Rating determines how many systems a ship can travel with the use of a single Warp Core. Most ships in the galaxy are either Jump 0 (J0), interplanetary travel only, or Jump-1 (J1). Some heavy commercial vessels will be equipped with J2 or J3 drives, and specialized military carriers may have up to Jump-9 capability, but this is prohibitively expensive technology.

The Class of a ship is a general measure of its size and capability. Ships are rated on a scale of Class-0 (C-0) to Class-V (C-V). The higher a ship's class, the larger, more powerful, and more expensive it is.

Ship Class is often abbreviated and combined with its Jump Rating. For example: J1C-II refers to a Jump-1 Class-II vessel. The chart below outlines what a ship of a given Class would generally be equipped with. Further amenities, functions, and capacity can be installed via Upgrades. Vessels with higher capacities tend to cost more initially. Hardpoints, Cryopods, and Escape Pods are determined by the vessel's make/model and are not included in the generic Class frame.

| FEATURE | C-0 | C-I | C-II | C-III | C-IV | C-V |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **DESCRIPTION** | Shuttlecraft & fighters. | Light commercial. | Medium commercial. | Heavy commercial. | Light military. | Heavy military. |
| **STARTING PRICE** | 20mcr | 50mcr | 150mcr | 300mcr | 700mcr | 1bcr |
| **BASE HULL** | 0 | 1 | 2 | 3 | 4 | 5 |
| **BASE MDMG** | 1 | 1d5 | 1d5 | 1d5 | 1d10 | 1d10 |
| **BASE THRUSTERS** | 20 | 45 | 40 | 35 | 30 | 20 |
| **BASE BATTLE** | 10 | 25 | 25 | 15 | 55 | 65 |
| **BASE SYSTEMS** | 20 | 30 | 35 | 40 | 25 | 30 |
| **UPGRADE SLOTS** | 2 | 4 | 6 | 8 | 10 | 12 |
| **FUEL CAPACITY** | 1d5 | 2d5 | 2d10 | 2d10+2 | 2d10+4 | 2d10+6 |
| **CREW CAPACITY** | 1 | 2d5 | 2d10 | 2d10+20 | 4d10+20 | 4d10+40 |
| **PASSENGER CAPACITY** | 0–6 | 0–12 | 0–12 | 6–24 | 12–32 | 24–48 |
| **CARGO CAPACITY** | 0–1 | 1–8 | 2–20 | 3–50 | 4–30 | 5–25 |
| **LANDING GEAR** | Yes | Aftermarket | Aftermarket | No | No | No |
| **JUMP CAPABILITY** | No | Aftermarket | Yes | Yes | Yes | Yes |

The base frames above can be further modified at additional cost. Most frames available to player characters will be prefabricated and unable to be modified further without Upgrades. However, to facilitate building custom ship frames or ships from different manufacturers, these pricing guidelines can be used:

| MODIFICATION | C-0 PRICE | C-I PRICE | C-II PRICE | C-III PRICE | C-IV PRICE | C-V PRICE |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Hull Point +1 | 1.5mcr | 3mcr | 6mcr | 9mcr | 12mcr | 15mcr |
| Battle +5 | 500kcr | 1mcr | 2mcr | 3mcr | 4mcr | 5mcr |
| Thrusters +5 | 250kcr | 500kcr | 1mcr | 1.5mcr | 2mcr | 2.5mcr |
| Systems +5 | 150kcr | 300kcr | 600kcr | 900kcr | 1.2mcr | 1.5mcr |
| Escape Pod +1 | 750kcr | 1.5mcr | 3mcr | 4.5mcr | 6mcr | 7.5mcr |
| Cryopod +1 | — | 250kcr | 500kcr | 750kcr | 1mcr | 1.25mcr |
| Crew Capacity +1 | 75kcr (max +1) | 150kcr | 300kcr | 450kcr | 600kcr | 750kcr |
| Fuel Capacity +1 | — | 100kcr | 200kcr | 300kcr | 400kcr | 500kcr |
| Passenger Capacity +1 | 25kcr (max +10) | 50kcr | 100kcr | 150kcr | 200kcr | 250kcr |
| Cargo Capacity +1 | 37.5kcr | 75kcr | 150kcr | 225kcr | 300kcr | 375kcr |

#### 1.3 UPGRADES & HARDPOINTS

Ships come equipped with basic systems, navigation, and life support. Any additional functionality has to be purchased and installed or retrofitted later, often at great cost.

##### *1.3.1 UPGRADES*

Every ship can be fitted with a certain number of Upgrades. Upgrades can be installed at X-, B-, or A-Class ports (Illegal Upgrades can only be installed at X-Class ports).

Average installation times (given availability, labor, etc.) are listed below. If your vessel is being serviced, the time cost is parallel and simultaneous, not cumulative and sequential (e.g., if installing multiple Upgrades that all take 1 month or less to complete, it will only take 1 month to get all the work done), though you may have to pay a premium on labor to the station providing the install services.

**The prices below are listed for Class-I vessels. Multiply the cost by your ship's Class to get its total cost. For Class-0 vessels, halve the cost but not the time.**

| AMENITY UPGRADES |  |  |  |
| :---: | :---: | :---: | :---: |
| **UPGRADE** | **COST** | **INST.** | **DESCRIPTION** |
| **Bioration Tank** | 200kcr | 1 week | Provides rations for biological Crewmembers for 1 year. |
| **Biplanar Gravity Generator** | 3mcr | 3 weeks | Produces artificial gravity aboard the ship. |
| **Cosmetic Remodel** | 500kcr | 1 month × Ship Class | Upgrade in appearance to the ship's interior including paint, furnishings, and other decorations. Does not consume an Upgrade slot. |
| **Habitat Module** | 4mcr | 1 month | Increases maximum crew capacity by up to 24 per Ship Class (e.g., Class-IV could have up to 96). |
| **Hangar/Dronebay** | 600kcr | 1 month | Allows for the storage and maintenance of 4 Class-0 Vessels. |
| **Machine Shop** | 5mcr | 3 weeks | Allows crew to repair up to 3 MDMG and 3 Hull without returning to port. Resupply for 1mcr. |
| **Medbay** | 2mcr | 3 weeks | [+] Body Saves to regain Health while aboard the ship. Offers other medical treatments available at Warden's discretion. |
| **Recreation Module** | 800kcr | 1 month | Entertainment hub, basic streaming plan, Zero-G pool table, minifridge. |
| **Science Lab** | 500kcr | 3 weeks | Allows for detailed research, study, testing, and experimentation of samples. |
| **MINOR UPGRADES** | ———— | ———— | ———— |
| **UPGRADE** | **COST** | **INST.** | **DESCRIPTION** |
| **Agar Cushioning** | 1.5mcr | 2 weeks | Upgraded Cryopods which cut Cryosickness from 1 week to 1d10 hours. Stats & Saves don't deteriorate from Cryosickness for the first ten years, then only every other year after that. |
| **Cargo Container** | 100kcr | 1 day | Cube-shaped metallic container that slots into the Cargo Bay (4 × Ship Class per Bay). Holds basically anything that doesn't require life support. It's a big space box, what did you expect? |
| **Cryochamber** | 5mcr | 2 weeks | Increase the number of Cryopods by up to 24 per Ship Class (e.g., Class-III could have up to 72). |
| **Dedicated Reactor** | 1mcr | 1 month | Grants +5 Systems. |
| **Deep Space Scanners** | 1mcr | 2 weeks | Increases the Range of all detection abilities by 1 Range band (i.e. what you used to be able to scan at Contact Range, you can now scan at Firing Range, etc.). |
| **Emergency Systems** | 1mcr | 1 month | Grants 1 month of emergency power and Life Support. Must be replaced after use. |
| **Onboard Android Databank** | 3mcr | 2 weeks | Backs up mechanical crew memory files weekly for reconstitution in new bot bodies (not included). |
| **Escape Pod** | 1.5mcr | 1 week | A replacement escape pod, holds up to 4 Passengers/class. |
| **Expanded Fuel Bay** | 2mcr | 3 weeks | Increases Max Fuel capacity by 12. |
| **Improved Radiators** | 1.5mcr | 1 month | Grants +5 Thrusters. |
| **Landing Gear** | 5mcr | 1 month × Ship Class | Retrofitted equipment for orbital landing and launch. |
| **Upgrade Rack** | 6mcr | 1 month | Exterior module. Grants +3 Upgrades. Each additional rack installed costs 2× the last. |
| **MAJOR UPGRADES** | ———— | ———— | ———— |
| **UPGRADE** | **COST** | **INST.** | **DESCRIPTION** |
| **Brig** | 1.5mcr | 2 weeks | Intern up to half the ship's total crew indefinitely. It's cramped, but not inhumane. Creatures in the Brig can't lose Stress. |
| **Cargo Bay** | 4mcr | 1 month | Enables the ship to hold a number of Cargo Containers up to 4× its Class. |
| **Engine Improvements** | 9mcr | 3 weeks | Grants +15 Thrusters. |
| **Enhanced A.I.** | 5.5mcr | 1 week | Grants +15 Systems. |
| **Expanded Frame** | 12mcr | 1 month × Ship Class | Structural alterations. Grants +5 Upgrades. Ships can only accommodate 1 of these per Ship Class level. Each additional Expanded Frame costs 2× the previous. |
| **Hydrogen Probe** | 3mcr | 1 month | Allows ship to harvest Fuel while in orbit around a gas giant planet. For each week in orbit, make a Systems Check. On a success, gain 1 Fuel. On a failure, gain no Fuel. |
| **Redundant Systems** | 5mcr | 1 month | Allows ship to ignore any one MDMG roll. Must be replaced after use. |
| **Signature Reduction** | 15mcr | 1 month | While activated, your ship is only detectable with a successful Systems Check [-] at Firing Range. Double Fuel cost and travel times while in use. Does not work in Core Space. |
| **Streamlined Fuel Injectors** | 4mcr | 2 months | Fuel lasts for 2 months of space travel (rounded up). Additionally, in the Movement Phase, bidding 1 Fuel counts as bidding 2 Fuel. |
| **Targeting Sensors** | 2mcr | 2 weeks | Systems Check (Firing Range): Confers [+] to Battle Checks made in ship-to-ship combat. |
| **ILLEGAL UPGRADES** | ———— | ———— | ———— |
| **UPGRADE** | **COST** | **INST.** | **DESCRIPTION** |
| **Accelerated Afterburner** | 2.5mcr | 2 weeks | If you win the Fuel bid while Pursuing or Evading a target, that target has [-] on their Thrusters Check. |
| **Comms Jammer** | 500kcr | 1 week | Systems Check: Allows for communication jamming and eavesdropping within Detection Range. |
| **Contraband Hold** | 500kcr | 1 month | Small, hidden compartment that holds 1 standard Cargo Container (not included). Very hard for boarding parties to detect. |
| **Embedded Clone Pod** | 15mcr | 2 months × Ship Class | Allows a Crewmember to be reconstituted in the form of their last time aboard the ship 1d10 months after their untimely demise. Can only generate one clone at a time. |
| **Expanded Ammo Bay** | 3mcr | 2 weeks | Your ship counts as one class greater for determining when you must resupply your Hardpoint ammo. |
| **Solar Scraper** | 15mcr | 1 month | Allows ship to harvest radiation while in orbit around a star. For each month in orbit, make a Systems Check. On a success, gain 1 Warp Core. On a failure, gain none. |
| **Transponder Emulator** | 10mcr | 1 month | Secondary comms relay masking the transponder code, callsign, and other ship metadata from other ships and structures in Firing Range or further. |

##### *1.3.2 HARDPOINTS*

Hardpoints function similarly to Upgrades, but are specially-installed ports meant for Weapons and Defenses.

**The prices below are listed for Class-I vessels. Multiply the cost by your ship's Class to get its total cost (or halve it for C-0 vessels).**

| DEFENSIVE HARDPOINTS |  |  |  |
| :---: | :---: | :---: | :---: |
| **UPGRADE** | **COST** | **INST.** | **DESCRIPTION** |
| **Adaptive Armor** | 9mcr | 1 month | Grants +2 Maximum Hull. |
| **Corona Generator** | 10mcr | 2 weeks | Grants +5 to Battle. During the Movement Phase of combat, if you maintain course, regain 1 Hull. |
| **Electronic Countermeasures** | 2mcr | 2 weeks | Grants +5 to Battle. Confers [-] to enemy ship's MDMG rolls. |
| **Laser Defense System** | 2mcr | 2 weeks | Grants +5 to Battle. Ignore enemy's MDMG Bonus from missile launchers. |
| **Reinforced Plating** | 4.5mcr | 1 month | Grants +1 Maximum Hull. |
| **Tractor Beam** | 3.5mcr | 2 weeks | When in Contact Range and attacking a ship of your Class or lower, instead of dealing MDMG, the target fails their next Thrusters Check. If you roll a Critical Success on your Battle Check, the target Critically Fails their next Thrusters Check. |
| **WEAPON HARDPOINTS** | ———— | ———— | ———— |
| **Autocannon** | 4mcr | 2 weeks | Grants +10 to Battle. Kinetic ballistic weaponry. |
| **Extra Hardpoint** | 3mcr | 2 weeks | Exterior module. Grants +1 Hardpoint without consuming a slot. Each additional Hardpoint costs 2× the previous. |
| **Heavy Missile Launcher** | 6mcr | 2 weeks | Grants +15 to Battle. Grants +1 MDMG. One big explosive. |
| **Laser Cannon** | 1.5mcr | 2 weeks | Grants +5 to Battle. Powerful laser beam used for scrapping hulks and cutting asteroids. |
| **Light Missile Launcher** | 5mcr | 2 weeks | Grants +15 to Battle. Many smaller explosives. |
| **Particle Beam** | 2mcr | 2 weeks | Grants +5 to Battle. Enemy must make a Systems Check or increase their Radiation Level by 1. |
| **Railgun** | 7mcr | 2 weeks | Grants +15 to Battle. Can be fired at Detection Range. |
| **MILITARY HARDPOINTS** | ———— | ———— | ———— |
| **Classified** | — | — | Not available to you. |

#### 1.4 DRIVES

Most ships will already have a Jump Drive installed when you encounter them; but if they don't, or you want to upgrade your current Jump Drive, they can be purchased and installed at an X or A-Class Port.

Jump Drives don't require an Upgrade slot to install, but you may only have one installed. Class-0 ships cannot have Jump Drives.

| DRIVE | COST | INST. | DESCRIPTION |
| :---: | :---: | :---: | :---: |
| **JUMP-1** | 10mcr | 1 month | Standard commercial Jump Drive. Allows for single-system jumps. |
| **JUMP-2** | 50mcr | 2 months | Standard military Jump Drive. Allows for 2-system jumps. |
| **JUMP-3** | 100mcr | 3 months | Long-range, cutting-edge Jump Drive. Allows for 3-system jumps. |

#### 1.5 USED AND SALVAGED UPGRADES

It is assumed that any ship component you purchase is (at minimum) secondhand to you. You can purchase Upgrades or Hardpoints of lower quality at decreased prices, but they will require extra Maintenance Checks and may come with some persistent issues.

There are 4 levels of Upgrade degradation:

- **Pristine:** Baseline prices, standard Maintenance routines.
- **Refurbished:** 25% discount, Maintenance Checks 2/month to keep functional.
- **Used:** 50% discount, Maintenance Checks 3/month to keep functional.
- **Risky:** 75% discount, Maintenance Checks as often as possible; if a Crit Failure is rolled on any Ship Stat Check, all installed Risky Upgrades are destroyed.

When swapping out ship Upgrades or Hardpoints, a Smarts (Mechanical Repair or Engineering) Check must be rolled to determine how much the Upgrade/Hardpoint has degraded.

- **Success:** The Upgrade/Hardpoint's degradation level worsens by 1 (Pristine → Refurbished → Used → Risky).
- **Critical Success:** The Upgrade/Hardpoint retains its original condition.
- **Failure:** The Upgrade/Hardpoint's degradation level worsens by 2 to a minimum of Risky.
- **Critical Failure:** The Upgrade/Hardpoint is destroyed regardless of its current condition and becomes scrap.

<img src="Assets/Art/MothershipSplash6.webp" alt="Mothership original splash art" class="splash-banner">

### 2.0 SPACE TRAVEL

The galaxy is vast and unforgiving, and you represent the rarest of the rare: someone for whom space travel is not only necessary, but common. You should know the basics.

#### 2.1 ORBITAL TRAVEL

Most large spaceships are not equipped for atmospheric entry and thus rely on shuttles, dropships, and other C-0 reentry vehicles to land or take off from the surface of a planet. Some C-I and C-II vessels may have had landing gear specially retrofitted to allow for ground-to-orbit launching/landing.

#### 2.2 INTERPLANETARY TRAVEL

Interplanetary (AKA subspace) trips can take anywhere from a few weeks to reach a nearby planet, to several years to reach the edge of the system. These trips are made via the ship's thrusters at a cost of 1 unit of Fuel for every month of travel. Fuel costs are paid up-front once the destination for the trip has been decided and it costs 1 Fuel to change course.

#### 2.3 REFUEL & RESUPPLY

You refuel and resupply your ship while in port. Each Ship Class uses a different grade of Fuel, but Fuel from a ship one class below yours can be siphoned and used on a 2:1 basis. Likewise, Fuel from a ship one class above yours can be used on a 1:2 basis. All other Fuel is incompatible.

After any number of engagements equal to your ship's class (minimum 1) where you used your ship's weapons, you must resupply. If you fail to resupply, Battle Checks have [-] during your next ship combat. After that, you automatically fail all Battle Checks.

| REFUEL & RESUPPLY | COST |
| :---: | :---: |
| **Class-0/Class-I Fuel** | 10kcr |
| **Class-II Fuel** | 20kcr |
| **Class-III Fuel** | 50kcr |
| **Class-IV Fuel** | 100kcr |
| **Class-V Fuel** | 200kcr |
| **Ship Ammunition** | 50kcr/Weapon |
| **Warp Core** | 1mcr |

#### 2.4 INTERSTELLAR TRAVEL

To travel to other star systems, you need a vessel equipped with a **Jump Drive.** Jump Drives are powerful engines designed to allow a ship to move faster than the speed of light and travel great distances by “jumping” into hyperspace.

##### *2.4.1 JUMP DRIVES*

Jump Drives are rated from 1–9 based on how large a jump they can make. The vast majority of commercial vessels built for interstellar travel use a Jump-1 Drive. Only powerful corporations, governments, and militaries use Jump-4 or greater. Jump-9 Drives are almost impossible to find anywhere, but they certainly exist. **Each Jump to hyperspace expends 1 unit of a powerful Fuel known as a Warp Core.**

##### *2.4.2 JUMP POINTS*

Before a ship can enter hyperspace, it must first travel to a Jump Point a safe distance away from neighboring planets or space stations. Many of these points are maintained at common 'warp lanes' by large corporations, allowing for an interstellar highway system. **It usually takes a few weeks to reach the Jump Point** from which the ship can then safely enter hyperspace.

##### *2.4.3 CRYOSLEEP*

Most crews spend their time in hyperspace in cryosleep (which requires Cryopods) while an android monitors an astronavigation computer. Those who stay awake during hyperspace jumps report strange and conflicting stories about the experience, and often androids' memories of their time in hyperspace are at best described as… unsettling.

##### *2.4.4 TIME DILATION*

Jumps through hyperspace take 2d10 days. However, the effects of relativity on Faster-Than-Light travel are uncertain and seemingly random. A crew returns from a Jump-3 voyage to learn they have been gone several years, while others return only a few seconds after their departure.

Regular Jump-1 warp lanes seem to wear down the chaotic effects, but those who make long jumps, like the legendary JUMP-9 COLONY SHIPS, are never expected to return. No one is certain what the effects of multiple Jump-9s would be. And perhaps those pioneers have returned, just millennia into our future. Or else somewhere in our past.

#### 2.5 BOOKING PASSAGE

You don't need to own a ship to get across the galaxy, but you need to pay your way, either in credits, trade, or labor.

| TRAVEL COSTS |  |  |  |
| :---: | :---: | :---: | :---: |
| **ORBITAL SHUTTLE** | **COST** | **HAULING & TOWING** | **COST** |
| Passenger Seating | 250cr | Interplanetary, C-I | 100kcr |
| Cargo Space | 1kcr | Interplanetary, C-II | 200kcr |
| Private Shuttle | 5kcr | Interstellar, C-I | 250kcr |
| Coffin Lander (orbit-to-ground only) | 50cr | Interstellar, C-II | 500kcr |
| **PASSENGER LINER (INTERPLANETARY)** | **COST** | **PASSENGER LINER (INTERSTELLAR)** | **COST** |
| Steerage Deck (Cryopod only) | 1kcr | Steerage Deck (Cryopod only) | 2kcr |
| Second Class (4 bunks/cabin, Cryopod) | 2.5kcr | Second Class (4 bunks/cabin, Cryopod) | 5kcr |
| First Class (private cabin, Cryopod) | 10kcr | First Class (private cabin, Cryopod) | 20kcr |
| Cargo Space | 5kcr | Cargo Space | 20kcr |
| Hangar Space | 25kcr | Hangar Space | 500kcr |
| To a distant planet | ×2 | Jump-2 Ticket | +10kcr |
| To edge of the system | ×3 | Jump-3 Ticket | +30kcr |
| **EXECUTIVE TRANSPORT (INTERPLANETARY)** | **COST** | **EXECUTIVE TRANSPORT (INTERSTELLAR)** | **COST** |
| Director Class (private suite, Cryopod) | 20kcr | Director Class (private suite, Cryopod) | 40kcr |
| Assistant Class (private cabin, Cryopod) | 12kcr | Assistant Class (private cabin, Cryopod) | 25kcr |
| Chartered Vessel | 1mcr | Chartered Vessel | 2mcr |

#### 2.6 SHIP-TO-SHIP CONTACT

##### *2.6.1 RANGE*

During encounters with other ships, your distance is measured abstractly in three **Range Bands.** These are:

- **Detection Range**: Ships are within the same star system. Communication is slow. They are typically not a combat risk. They can detect each other's size and trajectory.
- **Firing Range:** Ships are within weeks of each other. They can communicate with some latency and are at risk for combat.
- **Contact Range**: Ships are within a few days of each other. They can communicate without latency and are at risk for combat and boarding.

Your ship's scanners can be used to learn information about enemy craft, derelicts, space stations, as well as planets, moons, asteroids, and other celestial objects. The closer your Range, the more detailed information the ship's sensors and scanners can learn. The amount of detail they provide is left up to the Warden's discretion.

Communication across the vast reaches of space is difficult and time consuming. The greater the Range between the communicating parties, the more time it takes between sending and receiving messages.

| RANGE | INFORMATION REVEALED | HAILING LATENCY |
| :---: | ----- | ----- |
| Detection | Presence, trajectory, rough size, any unencrypted transponder broadcasts. | Minutes to hours. |
| Firing | All above, and Ship Class & type. | Seconds. |
| Contact | All above, and presence of lifeforms, ship's status. | None. |

Your **Transponder** constantly broadcasts important information about your ship including, among other things, its **Callsign**, the name of its Captain, as well as the type of ship, its Class, home port, destination, and more. Transponder information is subject to the Latency as shown on the Hailing table above.

##### *2.6.2 DISTRESS SIGNALS*

Occasionally, you may need to put your ship on emergency power, seal yourself in Cryopods, send out a Distress Signal, and wait for help. It's a long shot, but sometimes it's the only shot you've got. When this happens, roll on the **Distress Signals Table** below.

The result of this roll is how long it takes for help to pick up your Distress Signal and arrive to provide aid and/or finish you off.

| D10 | CORE WORLDS | ASTEROID BELT | RIM SPACE | DEEP SPACE/DEAD ZONES |
| :---: | :---: | :---: | :---: | :---: |
| 0 | **1d10 DAYS** Fate is on your side. | **2d10 DAYS** Fate is on your side. | **2d10 WEEKS** You're one of the lucky ones. | **2d10 MONTHS** Remember to review the Company policy on backpay in the event of a cryo-emergency. |
| 1–2 | **2d10 DAYS** Fate is on your side. | **2d10 WEEKS** You're one of the lucky ones. | **2d10 MONTHS** Remember to review the Company policy on backpay in the event of a cryo-emergency. | **2d10 YEARS** Make a Body Save or lose 1d5 to all Stats & Saves. |
| 3–4 | **1d10 WEEKS** You're one of the very lucky ones. | **2d10 MONTHS** Remember to review the Company policy on backpay in the event of a cryo-emergency. | **2d10 YEARS** Make a Body Save or lose 1d5 to all Stats & Saves. | **2d10 DECADES** Make a Body Save [-] or lose 1d10 to all Stats & Saves. |
| 5–6 | **1d10 MONTHS** Remember to review the Company policy on backpay in the event of a cryo-emergency. | **2d10 YEARS** Make a Body Save or lose 1d5 to all Stats & Saves. | **2d10 DECADES** Make a Body Save [-] or lose 1d10 to all Stats & Saves. | **NEVER** The ship floats endlessly in the all-consuming void of space. Thanks for playing Mommyship. |
| 7–8 | **2d10 MONTHS** Remember to review the Company policy on backpay in the event of a cryo-emergency. | **1d10 DECADES** Make a Body Save [-] or lose 1d10 to all Stats & Saves. | **NEVER** The ship floats endlessly in the all-consuming void of space. Thanks for playing Mommyship. | **NEVER** The ship floats endlessly in the all-consuming void of space. Thanks for playing Mommyship. |
| 9 | **1d10 YEARS** Make a Body Save [+] or lose 1d5 to all Stats & Saves. | **NEVER** The ship floats endlessly in the all-consuming void of space. Thanks for playing Mommyship. | **NEVER** The ship floats endlessly in the all-consuming void of space. Thanks for playing Mommyship. | **???** You wake up. Something is horribly, *horribly* wrong. |

#### 2.7 SHIP-TO-SHIP COMBAT

Combat between two spaceships may look slow and serene, but for the crews it's like a natural disaster. Each ship moves at impossible speeds, firing computer-aimed weaponry hours or even days away from their targets. The slightest bit of Damage can disable or destroy an entire ship, its crew dying from flames, radiation, suffocation, or worse.

##### *2.7.1 SHIP ROUNDS*

During a violent confrontation, we split time into intervals called ship rounds. Each ship round is made up of three phases: **Movement**, **Attack**, and **Morale**.

**How long is a ship round?** Anywhere from a few minutes to a few hours depending on how far apart the ships are. After each ship round, time returns to normal while you and the other players plan your next move in anticipation of the next ship round. Ships at Contact Range only have a few minutes between ship rounds (enough for a few rounds of normal time). Ships at Firing Range may have anywhere from a few hours to several days between rounds.

Most ship combats are over in 1 round. Almost none go longer than 3.

##### *2.7.2 WHAT CAN I DO?*

Ship-to-ship combat assumes each ship and its crew are doing everything they can to win the confrontation. It assumes that each ship and its crew are making evasive maneuvers, firing at their best targets, and generally making sound tactical decisions.

Your job is to discuss with the rest of the crew and decide when to fight, when to flee, and when to negotiate or surrender.

##### *2.7.3 THE MOVEMENT PHASE*

During the **Movement Phase**, ships decide whether they are going to attempt to evade or pursue other ships, or maintain their current course. They then decide how much extra Fuel (if any) they're willing to burn.

**If you're attempting to Evade…**

While you may spend as much Fuel as you like, to make an attempt you must spend a minimum amount of Fuel based on your Range from the enemy ship:

| RANGE | FUEL COST |
| :---: | :---: |
| Detection | 1 Fuel |
| Firing | 2 Fuel |
| Contact | 3 Fuel |

**If you're attempting to Pursue…**

You may spend any amount of Fuel you want (even none).

Once you have determined the total amount of Fuel you want to bid, each side reveals their choice and makes a Thrusters Check. Whoever bid more Fuel gets [+] on the Check.

- **Success:** You get what you want and increase or decrease the distance between you and the enemy ship by one band. If opposing ships all succeed, distances don't change.
- **Critical Success:** You make progress even if the enemy also succeeded.
- **Failure:** You don't get what you want, and the distance between you and the enemy ship does not change.
- **Critical Failure:** Your enemy makes progress even if they failed.

**If you're maintaining course…**

You don't spend any extra Fuel, but your enemy gets what they want (to evade or pursue) without having to roll (though they spend any extra Fuel they bid).

##### *2.7.4 THE ATTACK PHASE*

At the end of the **Movement Phase**, all ships within the Range of at least one functional weapon choose a target and make a Battle Check.

- **Success:** Ship deals MDMG.
- **Critical Success:** Ship deals double MDMG.
- **Failure:** Ship takes 1 MDMG in addition to any dealt by the enemy.
- **Critical Failure:** Ship takes 2 MDMG in addition to any dealt by the enemy.

If a ship has no weapons, or their weapons are offline, they automatically fail all Battle Checks if they are being attacked.

**Megadamage (MDMG)** is like a character's Damage and Wounds rolled into one. Whenever your ship takes MDMG, add it to any previous MDMG incurred, mark the new total on the tracker, and apply the listed effect. If your ship ever has 9 or more total MDMG, it is destroyed.

| MDMG | EFFECT |
| :---: | :---- |
| 00 | **ALL SYSTEMS NOMINAL.** 5x5, ready to ride. |
| 01 | **EMERGENCY FUEL LEAK.** Every time you spend Fuel, you spend 1 more. |
| 02 | **FIRE ON DECK.** Fire spreads around the ship, creating a Toxic/Corrosive atmosphere. Deals 1d10 DMG/round to crew in affected areas. |
| 03 | **HULL BREACH.** All aboard make a Body Save or take 1 Wound (Explosion). On a Critical Failure, get violently sucked into Space. |
| 04 | **RADIATION LEAK.** Radiation Level increases every hour. |
| 05 | **WEAPONS OFFLINE.** Automatically fail Battle Checks. 10% chance a Hardpoint is destroyed. |
| 06 | **NAVIGATION OFFLINE.** Automatically fail Thrusters Checks. 10% chance all navigation data is wiped. |
| 07 | **LIFE SUPPORT OFFLINE.** Oxygen limited to 1d10 × maximum crew capacity. |
| 08 | **DEAD IN THE WATER.** All systems offline, emergency power only. |
| 09 | **ABANDON SHIP!** Ship is destroyed in 1d10 minutes. |

**Hull** works like a character's Armor Points. Your ship ignores all MDMG less than its current Hull. If it takes MDMG equal to or greater than its Hull in one hit, reduce the MDMG inflicted by the amount of the Hull, apply any remaining, and then reduce the current Hull by 1 (minimum 0).

###### *2.7.4.1 Ship Class and Unwinnable Fights*

You have [+] on all Battle Checks and MDMG rolls against ships 1 Class lower than yours. Ships 2 or more classes higher than enemy ships are assumed to be unbeatable in a direct confrontation unless the Warden decides otherwise.

##### *2.7.5 THE MORALE PHASE*

After any Ship Round where an enemy takes MDMG, they must make a Morale Check. To make a Morale Check, roll 1d10. If they roll under their current MDMG, they may send a hail offering a ceasefire to begin negotiations.

##### *2.7.6 AFTER BATTLE REPORT*

After any violent confrontation where your ship takes MDMG, make a Systems Check. On a failure, roll on the [**Maintenance Issues table**](#2.8.5-maintenance-issues-table). On a Critical Failure, roll on the table twice.

#### 2.8 REPAIRING YOUR SHIP

Eventually, your ship will need a tune-up, or sometimes a complete overhaul. When this happens, you'll need to get it repaired.

##### *2.8.1 STARTING CONDITION*

Every ship starts with a little wear-and-tear. Whenever you acquire a ship, roll 1d5+1 times on the [**Maintenance Issues table**](#2.8.5-maintenance-issues-table).

##### *2.8.2 ROUTINE MAINTENANCE*

Once a month (or more), your ship needs to perform a **Maintenance Check**. To do this, make a Systems Check. If your vessel contains parts of a lower level of degradation than Pristine, you must make these Checks as determined by the most degraded Upgrade currently installed. These are listed in [section 1.5](#1.5-used-and-salvaged-upgrades).

- **Success:** Everything continues working as normal.
- **Critical Success:** [+] the next time you roll on the Maintenance Issues table.
- **Failure:** Roll on the Maintenance Issues table, and everyone onboard gains 1 Stress.
- **Critical Failure:** Roll on the Maintenance Issues table twice, and everyone onboard makes a Panic Check.

##### *2.8.3 MINOR REPAIRS*

**Minor Repairs** cover cosmetic issues, clean-up, and other handyman-type work that can be handled by the crew while the ship is in flight. Minor Repairs take roughly 2d10 days to perform and require no roll.

If you have Refurbished or Used Upgrades/Hardpoints installed on your ship and an Engineer onboard, you can take an additional 2d10 days per Upgrade/Hardpoint to improve their degradation level by 1 (Used → Refurbished → Pristine). Risky Upgrades or Hardpoints cannot benefit from Minor Repairs.

##### *2.8.4 MAJOR REPAIRS*

**Major Repairs** cover large-scale structural or system Damage, including repairing MDMG and Hull. **Major Repairs can only be performed in port and cost 1mcr multiplied by the Ship's Class (or halved for C-0)** unless you have a Machine Shop on board. Every point of Hull or Megadamage counts as a separate Major Repair for cost purposes.

Major Repairs can take anywhere from a few months to up to a year depending on the severity of the Damage, and availability of parts and labor. They will not change the condition of Upgrades or Hardpoints.

##### *2.8.5 MAINTENANCE ISSUES TABLE*

***Note:** If a repair has an associated 10% rate for something to go wrong, roll 1d10. On a 0, the effect triggers. For 50% odds, even-digit rolls are good and odd-digit rolls are bad.*

| MAINTENANCE ISSUES |  |  |  |  |  |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **MINOR REPAIRS** | ———— | ———— | ———— | ———— | ———— |
| 00 | Rancid smell permeates cabins. | 34 | Worn landing struts. | 67 | Miscalibrated guidance system. |
| 01 | Huge mess everywhere. | 35 | Out-of-date air filters. |  |  |
| 02 | Staticky comms. | 36 | Corroded pipes. | 68 | Overloaded power storage. |
| 03 | Faulty electrical system. | 37 | Inaccurate orbital transfer information. | 69 | Sensor arrays only display porn. |
| 04 | Loose couplings. | 38 | Worn out Fuel injector nozzles. | 70 | Failed water recovery systems. |
| 05 | Hidden (highly illegal) contraband. | 39 | Inoperative exterior lighting. | 71 | Micrometeoroid Hull Damage. |
| 06 | Autopilot systems down. | 40 | Defective intercomms. | 72 | Carbon dioxide alarm won't stop. |
| 07 | Leaking hydraulics. | 41 | Inadequate waste recycling. | 73 | Solar panel degradation. |
| 08 | Creaking hull. | 42 | Faulty altitude control thrusters. | 74 | Computer failure from cosmic radiation. |
| 09 | Damaged bulkheads. | 43 | Insufficient Life Support redundancy. | 75 | Overloaded circuitry. |
| 10 | Misaligned docking clamps. | 44 | Delayed communications relay. | 76 | Malfunctioning plasma thruster. |
| 11 | Viewports blocked. | 45 | Damaged Fuel lines. | 77 | Dehumidifier failure. |
| 12 | Jammed exterior airlocks. | 46 | Corroded exhaust manifolds. | 78 | Intermittent electrical outages. |
| 13 | Dysfunctional gravity plating. | 47 | Terminal displays burnt out. | 79 | Fire suppression out of code. |
| 14 | Out of code compliance. | 48 | Check engine light. | 80 | Damaged floor panelling. |
| 15 | Controls sticking. | 49 | Failed data backup systems. | 81 | Broken light fixture in remote corridor. |
| 16 | Coolant leak. | 50 | Faulty door locks. | 82 | Damaged coolant pump. |
| 17 | Miscalibrated thruster gimbal system. | 51 | Buggy communications. | 83 | Cracked viewports. |
| 18 | Bevy of OSHA violations. | 52 | Infested food storage facilities. | 84 | Systems full of malware. |
| 19 | Blocked air vents. | 53 | Corrupted data banks. | 85 | Leaky Fuel valve. |
| 20 | Emergency lighting only. | 54 | Jammed cargo bay doors. | 86 | Jammed exhaust vent. |
| 21 | Internal networking issues. | 55 | Flickering interior lights. | 87 | Clogged waste disposal chute. |
| 22 | Inaccurate data collection. | 56 | Failed airlock seals. | 88 | Lifts non-functional. |
| **MAJOR REPAIRS** | ———— | ———— | ———— | ———— | ———— |
| 23 | **Oxygen Leak.** If the ship is low on O2, lose 1d5 extra per day. | 57 | **Fuel Leak.** Burn +1 Fuel every time you spend Fuel. | 89 | **Clogged Air Filtration.** Max crew capacity is halved. (Mechs don't count). |
| 24 | **Throttled Afterburners.** -2d10 Thrusters. | 58 | **Jump Bug.** 10% chance Jump takes 2d10 months, not 2d10 days. | 90 | **Broken Backup Generator.** No emergency power. |
| 25 | **Lemon.** Maintenance Checks at [-]. | 59 | **Fragile.** Always take +1 MDMG. | 91 | **Weakened Frame.** -1 Maximum Hull. |
| 26 | **Slow Acceleration.** +1 week to travel. | 60 | **Cracked Heat Shields.** Ship becomes Extremely Hot or Cold. | 92 | **Chemical Spill.** Body Saves [-] while onboard. |
| 27 | **Inaccurate Navigation.** 50% chance pathfinding is faulty. | 61 | **Outdated Software.** -1d10 Systems. | 93 | **Scanner Reduction.** Ship has to be one Range closer to broadcast/receive. |
| 28 | **Miscalibrated Targeting Sensors.** -1d10 Battle. | 62 | **Contaminated Water Purification.** Parasites in the water supply. | 94 | **Transponder Slagged.** Cannot turn Transponder On. |
| 29 | **Faulty Cryopods.** Nightmares. Cryosickness lasts +1 week. | 63 | **Malfunctioning Waste Management.** One Amenity becomes non-functional. | 95 | **Corrupted A.I.** [-] on Systems Checks. |
| 30 | **Malfunctioning Escape Pods.** 50% chance will not eject from ship. | 64 | **Fusion Reactor Overheating.** -1d10 Thrusters. | 96 | **Drive Jamming.** 10% chance a Warp Core is consumed and the Jump fails. |
| 31 | **Cycling Transponder.** Unable to send Distress Signals. | 65 | **Failed Radiation Shielding.** +1 Radiation Level. | 97 | **Rust Bucket.** +1 Minimum Stress to all crew. |
| 32 | **Sabotaged Coolant System.** [-] Body Saves while onboard. | 66 | **Structural Damage.** One Upgrade becomes non-functional. | 98 | **Security Malfunction.** 1d5 bulkheads seal and will not open. |
| 33 | **Death Trap.** [-] on all Ship Checks. |  |  | 99 | **Slagged.** One Hardpoint becomes inoperable. |

<img src="Assets/Art/MothershipSplash4.webp" alt="Mothership original splash art" class="splash-banner">

### 3.0 OPERATING COSTS

Everything about spacecraft, from purchasing one to paying for its repairs, maintenance, and upgrades, is out of reach to the average person. Only the most powerful planets, corporations, and the uber-wealthy can commission a brand new ship to be built. Even for those who can afford to own one, it often ends up consuming their entire lives.

Most people who wind up on ships don't own them — they're contracted to a Company or Military that foots the bill for repairs, supplies, and salaries. For the few lucky (or unlucky) enough to find themselves an Owner-Operator or Freelancer, you'll be taking on the majority of costs yourself as a part of doing business.

| WHO PAYS THE BILLS? |  |  |  |
| ----- | :---: | :---: | :---: |
|  | **COMPANY** | **MILITARY** | **OWNER-OPERATOR** |
| **SALARY** | ✔ | ✔ | ✔ |
| **HAZARD PAY** | Approved only. | ✔ | Approved only. |
| **JUMP PAY** | Approved only. | ✔ | Approved only. |
| **ROOM & BOARD** | On ship only. | On ship and base. | On ship only. |
| **REFUELING** | ✔ | ✔ | ✔ |
| **WARP CORES** | Approved only. | ✔ | Approved only. |
| **REPAIRS** | Approved only. | ✔ | ✖ |
| **UPGRADES** | Approved only. | Approved only. | ✖ |
| **SKILL TRAINING** | ✖ | Approved only. | ✖ |
| **MEDICAL TREATMENT** | ✖ | On ship and base. | ✖ |
| **EQUIPMENT** | Approved only. | Approved only. | ✖ |
| **WEAPONS** | ✖ | ✔ | ✖ |

#### 3.1 THE COMPANY

When you work for a Company, they own the ship and cover any associated costs. You just cash a paycheck and do the work they ask. And don't get any fancy ideas about a new Upgrade; the bean counters at HQ aren't going to approve frivolous expense requests.

#### 3.2 THE MILITARY

On a military ship, everything is covered, provided it's part of the mission. You don't even have to worry about whether you'll be able to afford your medical bills. They'll even cover Skill training if it's relevant to your occupational specialty, just so long as you follow orders.

#### 3.3 OWNER-OPERATORS

Sometimes, ships are owned by small banking firms who co-finance the purchase of a ship and then either lease it or enter into a co-ownership agreement with another small company. The firm fronts the cost of the vessel and business operations, and in turn takes the majority share of the profits. In exchange, you get a ship and a relatively free hand in conducting your business on the Rim as an Owner-Operator of a small vessel.

As an Owner-Operator, you have a new Save, called a **Bankruptcy Save,** which starts at 2d10 + 10. Each year (or quarter, as determined by your Warden and the severity of your contract), make a Bankruptcy Save to determine the financial health of the vessel.

- **Success:** You scrape by. Choose one of the following:
    - Purchase 1 Minor Upgrade or Amenity for the ship.
    - Perform 1 Major Repair on the ship.
    - Pay each Crewmember a bonus of 2d5 months Salary.
    - Raise your Bankruptcy Save by 1d5.
- **Critical Success:** You turn a small profit. Choose one of the following:
    - Purchase 1 Major Upgrade or Hardpoint for the ship.
    - Perform 1d5 Major Repairs on the ship.
    - Pay each Crewmember a bonus of 1d5×100kcr.
    - Raise your Bankruptcy Save by 2d5.
- **Failure:** You owe 1d5 Debt to your financiers. After adding the total, make one Debt Check.
- **Critical Failure:** The vessel goes into Bankruptcy, loses financing, becomes a Freelancer, and owes 2d5 Debt to the worst people imaginable. After adding the total, make one Debt Check.

#### 3.4 FREELANCERS

Freelancers are people who have bought outright (or otherwise acquired) a vessel, and pay for everything themselves. It's incredibly expensive and they have to beg, barter, borrow, or steal credits wherever they can find them. But on the upside, you have what few in the galaxy do: *freedom.*

#### 3.5 DEBT

Most Owner-Operators and Freelancers will inevitably wind up with Debt, which represents the amount they owe a specific organization for the purchase, upkeep, or operation of their vessel. Much like Stress, Debt can be accrued and potentially leveraged into advancements for your crew and ship, but having too much of it opens you up to negative consequences and potential downward spirals. It's easy to fall into Debt, but hard to dig yourself out. Perhaps counterintuitively, **you cannot repay Debt with credits** — it represents the leverage another entity has over yourself or your crew rather than an actual monetary amount.

- **5 Debt** buys a cramped, cobbled-together deathtrap that is only good for limping from system to system.
- **10 Debt** buys a small, no-frills jump courier with all the essentials, but limited space for crew and cargo.
- **15 Debt** secures a battered commercial vessel able to earn a living (e.g., a freighter, salvage cutter, or asteroid breaker).

For crews without ships, Debt could instead represent a sum they owe a loan shark, the cost of buying out a Company contract, legal fees, etc.

##### *3.5.1 WHAT'S IN IT FOR ME?*

It's not all bad! When a crew has Debt, their creditors pay for the following costs:

- Fuel and Warp Cores
- Basic Minor and Major Repairs and maintenance
- Contractor salaries (but not signing bonuses)

Additionally, more Debt can be taken on by the crew for various benefits:

- **Ship Upgrades:** +1 Debt for each 5mcr of new Upgrades, Weapons, or Amenities.
- **Cyberware:** +1 Debt per Crewmember to gain a Trained Skill implant.
- **Hard Currency:** +1 Debt to immediately gain 1d5 × Salary for all crew & Contractors.
- **Shore Leave:** +1 Debt to take Shore Leave in a B-Class Port.

##### *3.5.2 DEBT CHECKS*

A Debt Check determines whether a crew can handle the pressure of interest piling up on their obligations. To make a Debt Check, roll the Panic Die (1d20) and attempt to roll greater than your current Debt. If you fail, look up the relevant result on the Debt Table. A crew cannot have more than 20 Debt. A crew at 20 Debt cannot voluntarily take on additional Debt or receive benefits that require doing so.

A crew makes a Debt Check when:

- They finish Shore Leave.
- They gain Debt for any reason.
- They go a significant period of time without bringing in any real work.
- They upset their creditors somehow.

##### *3.5.3 DEBT TABLE (D20)*

| D20 | EFFECT |
| :---: | ----- |
| 01 | **DIVIDEND.** A spending rewards program accrues, giving each Crewmember a Jump-1 ticket. |
| 02 | **OPPORTUNITY.** The crew's creditors demand they do a sensitive and/or dangerous job for them at enhanced pay ([+] Payday roll). |
| 03 | **ANXIETY.** Each Crewmember gains 1 Stress. |
| 04 | **CREDIT LIMIT.** The crew cannot take on additional Debt or go on Shore Leave until the next time Debt is reduced. |
| 05 | **WEAR AND TEAR.** The crew's piece of Armor with the highest AP breaks and is reduced to 0 AP. |
| 06 | **NEPOTISM.** The crew's creditors force a Contractor of dubious merit on them. |
| 07 | **LOCKDOWN.** The crew's creditors refuse to pay for Warp Cores until the next time their Debt is reduced. Each Crewmember's Minimum Stress is increased by 1. |
| 08 | **BEHEST.** The crew's creditors demand they do a job for them at normal pay. |
| 09 | **OUT OF WARRANTY.** Each Crewmember determines the piece of equipment they use most often. It breaks and must be replaced. |
| 10 | **PAYROLL ISSUE.** Contractor paychecks bounce. Pay each Contractor one month's Salary out of pocket, or make a Loyalty Save to prevent them from quitting. |
| 11 | **ASSURANCE.** The crew's creditors must approve all of their major movements and jobs until the next time Debt is reduced. |
| 12 | **FROZEN.** The crew's bank accounts are frozen. They cannot spend credits until the next time Debt is reduced. |
| 13 | **BEST BEFORE.** All of the crew's consumable items (Chems, food, ammo) expire and must be replaced. |
| 14 | **CHAPERONE.** A representative of the crew's creditors joins them on their next job. It would be extremely bad for the crew if the rep is harmed. |
| 15 | **HEADHUNTER.** A faction attempts to poach the crew's Contractors with an offer their creditors won't match. Make a Loyalty Save to prevent them from quitting. |
| 16 | **FINAL NOTICE.** The crew loses 50% of its credits to a critically overdue bill, but gets -1 Debt. |
| 17 | **LOCKOUT.** The crew is barred from a particular port until their Debt is cleared. Each Crewmember increases their Minimum Stress by 1. |
| 18 | **EXTORTION.** The crew's creditors demand they do a job for them, with no pay. |
| 19 | **ACQUISITION.** A new organization purchases the crew's Debt and demands immediate payment. The crew loses 80% of its credits, but gets -1 Debt. |
| 20 | **LIQUIDATION.** A squad of repo-men arrives to reclaim the crew's belongings, by deadly force if necessary. |

##### *3.5.4 DIGGING YOUR WAY OUT*

Debt tracks “big” income and costs. Most jobs that a crew in Debt takes on pay in the form of reducing their Debt:

- **-1 Debt:** Any standard job. A particularly good load of salvage, or precious materials.
- **-2 or -3 Debt:** A longer or more complex job, or one that would warrant Hazard Pay. A singularly valuable piece of salvage or a covert task performed.
- **-4 or more Debt:** Meticulous heists, or genuine acts of heroism that save infrastructure or creditor assets. Artifacts that could change the balance of power in a sector.

A crew in Debt still tracks “small” income and expenditures, and a few credits usually trickle over into their accounts after their creditors take their share of any reward. When a crew gets paid for a job or sells a haul, they reduce their Debt and then make a Payday roll: the crew splits 1d10×10kcr between themselves.

Crews having trouble scraping together pocket money can take jobs “off the books” by Moonlighting; these jobs pay standard Salary, but cannot reduce Debt. This is universally frowned upon by creditors.

<img src="Assets/Art/MothershipSplash0b.webp" alt="Mothership original splash art" class="splash-banner">

### 4.0 SHIP QUICK GUIDE

| [STAT CHECKS](#1.1-how-a-ship-works) Roll 1d100 under your Thrusters, Battle, or Systems to accomplish the task. Failure incurs a Fear Save from everyone aboard. A roll of 90–99 is always a failure; 00 is a Critical Success. |  | [TRAVEL](#2.0-space-travel) 1 Fuel = 1 month subspace travel. 1 Warp Core = 1 Hyperspace Jump. Burn additional [Fuel](#2.3-refuel-&-resupply) to pursue or evade another vessel. |  | [CREW](#1.1.2-roles-on-a-ship) Ships require ¼ base max. crew capacity to function, and must always have a Captain. Other [Roles](#1.1.2-roles-on-a-ship) grant additional benefits to Stat Checks & Saves. |
| ----- | ----- | ----- | ----- | ----- |
|  |  |  |  |  |
| [**SHIP-TO-SHIP COMBAT**](#2.7-ship-to-ship-combat) **1. [Movement](#2.7.3-the-movement-phase):** Evade, Pursue, or maintain course. Can bid Fuel. **2. [Attack](#2.7.4-the-attack-phase):** Choose a target, Battle Check. Wreck shit or die. **3. [Morale](#2.7.5-the-morale-phase):** If you deal MDMG, enemy Morale Check or they might offer a ceasefire. **4. [Battle Report](#2.7.6-after-battle-report):** Systems Check if damaged; [Maintenance Issues](#2.8.5-maintenance-issues-table). |  | [**MAINTENANCE**](#2.8.2-routine-maintenance) Regular Systems Checks for routine upkeep. [**Minor Repairs**](#2.8.3-minor-repairs) = 2d10 days to fix 'er up. [**Major Repairs**](#2.8.4-major-repairs) can only be made at port for 1mcr × Ship's Class. Each point of **Hull** or **MDMG** = 1 Major Repair. |  | [**TRANSPONDER**](#1.1.1-parts-of-a-ship) Automated radio broadcast of Ship's ID, Captain, Make, Model, Jump, Class, Type, & Status. Used to transmit Distress Signals in an emergency. Subject to Range Latency. **Illegal/suspect if disabled.** |
|  |  |  |  |  |
| [**MEGADAMAGE (MDMG)**](#2.7.4-the-attack-phase) All ships can take up to 8 MDMG. Each MDMG point affects Ship's Stats & functions. See table. Deal MDMG using [Hardpoints & Weapons](#1.3.2-hardpoints) as per [Ship Combat](#2.7-ship-to-ship-combat). |  | [**HULL (SHIP ARMOR)**](#1.1.1-parts-of-a-ship) Ignore MDMG below current Hull. If MDMG ≥ the ship's current Hull, subtract Hull from MDMG, apply the remainder, then lose 1 Hull (minimum 0). ≥9 MDMG = **BOOM!** |  | [**DISTRESS SIGNALS**](#2.6.2-distress-signals) For when things go really bad and your ship is dead in the void, roll on the table to see if/when aid arrives. Seal yourself in [Cryopods](#2.4.3-cryosleep) and pray to literally anything. |
|  |  |  |  |  |
| [**RANGE**](#2.6.1-range) |  |  |  |  |
| **DETECTION:** Within the same system; communication is slow. Low combat risk. **FIRING:** Within weeks of each other; communicate with minor delay. Moderate combat risk. **CONTACT:** Within a few days of each other; no communication delay. High combat and boarding risk. |  |  |  |  |

*♥ It's a big, scary galaxy out there. Just do your best and try to have fun before your untimely demise. ♥*
