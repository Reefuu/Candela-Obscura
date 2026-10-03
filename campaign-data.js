// Initial data imported from your workbook. Live changes are saved separately.
export const CAMPAIGNS = [
  {
    "id": "the-prophets",
    "name": "The Prophets",
    "schemaVersion": 1,
    "revision": 0,
    "chapterHouse": "",
    "tone": "",
    "feel": "",
    "notes": "",
    "illumination": 11,
    "illuminationMax": 24,
    "resources": {
      "stitch": {
        "current": 3,
        "max": 3
      },
      "refresh": {
        "current": 3,
        "max": 3
      },
      "train": {
        "current": 2,
        "max": 2
      }
    },
    "gildedDice": 3,
    "gildedDiceMax": 3,
    "abilities": [
      {
        "id": "ability-23",
        "name": "Stamina Training",
        "description": "Your circle has three gilded dice at the beginning of every assignment that anyone may add as +1d to any roll. Once a die has been rolled, it is expended.",
        "selected": true
      },
      {
        "id": "ability-26",
        "name": "Nobody Left Behind",
        "description": "When a member of your circle drops incapacitated from taking too many marks, on a roll a player makes in the scene to protect them, or get them out of danger, has +1d.",
        "selected": false
      },
      {
        "id": "ability-29",
        "name": "In This Together",
        "description": "When you spend drive to help an ally on a roll, on a result of 3 or less, you both earn back 1 drive point of your choice.",
        "selected": false
      },
      {
        "id": "ability-33",
        "name": "Interdisciplinary",
        "description": "When choosing a new ability during character advancement, once per campaign, each character may choose an ability from a character role or specialty outside their own.",
        "selected": true
      },
      {
        "id": "ability-36",
        "name": "Resource Management",
        "description": "When your circle hits a milestone on the Illumination Track, earn back 1 Stitch, Refresh, or Train resource.",
        "selected": false
      },
      {
        "id": "ability-39",
        "name": "One Last Run",
        "description": "When you select this ability, the next assignment is your last. Everyone gets to take all four options during this character advancement instead of only two.",
        "selected": false
      }
    ],
    "characters": {
      "wysel": {
        "id": "wysel",
        "name": "Wysel Stellamui",
        "pronouns": "She/Her",
        "role": "Face",
        "specialty": "Journalist",
        "style": "A sneaky weasel",
        "catalyst": "I met the wrong people and I got cursed",
        "question": "Who cursed me?",
        "sourceCircle": "???",
        "portrait": "./assets/wysel.png",
        "actions": {
          "move": {
            "rating": 1,
            "gilded": false
          },
          "strike": {
            "rating": 0,
            "gilded": false
          },
          "control": {
            "rating": 0,
            "gilded": false
          },
          "sway": {
            "rating": 0,
            "gilded": false
          },
          "read": {
            "rating": 1,
            "gilded": false
          },
          "hide": {
            "rating": 2,
            "gilded": true
          },
          "survey": {
            "rating": 2,
            "gilded": true
          },
          "focus": {
            "rating": 1,
            "gilded": false
          },
          "sense": {
            "rating": 2,
            "gilded": false
          }
        },
        "drives": {
          "nerve": {
            "current": 1,
            "max": 1,
            "resistance": 0
          },
          "cunning": {
            "current": 3,
            "max": 6,
            "resistance": 1
          },
          "intuition": {
            "current": 4,
            "max": 4,
            "resistance": 1
          }
        },
        "marks": {
          "body": 0,
          "brain": 0,
          "bleed": 0
        },
        "scars": "",
        "abilities": [
          {
            "id": "ability-11",
            "name": "I Know A Guy",
            "description": "Once per assignment, ask the GM who you know nearby that could help you. They will give you a temporary contact, and explain why they might have insight into the investigation.",
            "selected": false
          },
          {
            "id": "ability-14",
            "name": "Sweet Talk",
            "description": "You know how to work the room. After you make small talk with someone, you may add +1d on any Read rolls you make in which they are the target. If your current Cunning resistance is 2 or higher, that die is gilded.",
            "selected": true
          },
          {
            "id": "ability-18",
            "name": "Cool Under Pressure",
            "description": "On any high-stakes roll, you may always spend Cunning instead of the drive the action falls under.",
            "selected": false
          },
          {
            "id": "ability-23",
            "name": "Insider Access",
            "description": "Your line of work offers you special privileges. Once per assignment, automatically gain access to an important person or place by using the Press Credentials gear.",
            "selected": true
          },
          {
            "id": "ability-26",
            "name": "Open Book",
            "description": "You can get people to open up to you very quickly. When you attempt to connect with others by sharing something deeply personal, add a number of dice equal to your current Cunning resistance to a Sway roll. On a success, they will reciprocate.",
            "selected": false
          },
          {
            "id": "ability-30",
            "name": "Lie Detector",
            "description": "When you make a Read roll in an attempt to figure out whether a person is telling the truth, gild an additional die. The first Cunning you spend on the roll is worth +2d instead of +1d.",
            "selected": false
          },
          {
            "id": "ability-33",
            "name": "Press Conference",
            "description": "You can spend 1 Cunning to gather a large group of people together to make announcements, ask questions, or stage a distraction. All Cunning rolls you make at this assembly take +1d.",
            "selected": false
          },
          {
            "id": "ability-36",
            "name": "In the Trenches",
            "description": "You’ve done enough dangerous journalism work to know how to keep yourself safe. Once per assignment, you may burn 1 Cunning resistance to soak a Body mark.",
            "selected": true
          },
          {
            "id": "ability-39",
            "name": "Well-Researched",
            "description": "You can spend 1 Intuition to ask the GM a specific question about a place, group, or concept that you may have researched before the assignment. They will tell you what you know from that preparation.",
            "selected": false
          }
        ],
        "gear": [
          {
            "id": "gear-33",
            "name": "Bleed Detector",
            "selected": false
          },
          {
            "id": "gear-34",
            "name": "Hand Weapon",
            "selected": false
          },
          {
            "id": "gear-35",
            "name": "Bleed Containment Vial",
            "selected": true
          },
          {
            "id": "gear-36",
            "name": "Press Credentials",
            "selected": false
          },
          {
            "id": "gear-37",
            "name": "Camera",
            "selected": false
          },
          {
            "id": "gear-38",
            "name": "Surveillance Equipment",
            "selected": false
          },
          {
            "id": "gear-39",
            "name": "lead gloves",
            "selected": true
          }
        ],
        "relationships": [
          {
            "name": "Stellamui family",
            "relation": "Family"
          },
          {
            "name": "Sol",
            "relation": "Lightkeeper & guardian figure"
          }
        ],
        "notes": "10 dollars",
        "illuminationKeys": [
          "Gather Statements",
          "Hunt Down a Lead",
          "Speak Truth to Power"
        ],
        "illuminationKeyChecks": [],
        "version": 0,
        "sourceSheet": "Journalist (Wysel)",
        "level": 2
      },
      "keith": {
        "id": "keith",
        "name": "Keith Collins",
        "pronouns": "He/Him",
        "role": "Face",
        "specialty": "Journalist",
        "style": "The Gilded Key\nThe Ruined Heir(Style)",
        "catalyst": "Drink. Forget. Survive.",
        "question": "Can I escape my family's legacy, or am I already damned?",
        "sourceCircle": "",
        "portrait": "./assets/keith.png",
        "actions": {
          "move": {
            "rating": 0,
            "gilded": false
          },
          "strike": {
            "rating": 0,
            "gilded": false
          },
          "control": {
            "rating": 0,
            "gilded": false
          },
          "sway": {
            "rating": 2,
            "gilded": true
          },
          "read": {
            "rating": 2,
            "gilded": false
          },
          "hide": {
            "rating": 0,
            "gilded": false
          },
          "survey": {
            "rating": 2,
            "gilded": true
          },
          "focus": {
            "rating": 2,
            "gilded": false
          },
          "sense": {
            "rating": 1,
            "gilded": false
          }
        },
        "drives": {
          "nerve": {
            "current": 0,
            "max": 0,
            "resistance": 0
          },
          "cunning": {
            "current": 5,
            "max": 8,
            "resistance": 2
          },
          "intuition": {
            "current": 3,
            "max": 3,
            "resistance": 1
          }
        },
        "marks": {
          "body": 0,
          "brain": 0,
          "bleed": 0
        },
        "scars": "",
        "abilities": [
          {
            "id": "ability-11",
            "name": "I Know A Guy",
            "description": "Once per assignment, ask the GM who you know nearby that could help you. They will give you a temporary contact, and explain why they might have insight into the investigation.",
            "selected": true
          },
          {
            "id": "ability-14",
            "name": "Sweet Talk",
            "description": "You know how to work the room. After you make small talk with someone, you may add +1d on any Read rolls you make in which they are the target. If your current Cunning resistance is 2 or higher, that die is gilded.",
            "selected": false
          },
          {
            "id": "ability-18",
            "name": "Cool Under Pressure",
            "description": "On any high-stakes roll, you may always spend Cunning instead of the drive the action falls under.",
            "selected": false
          },
          {
            "id": "ability-23",
            "name": "Insider Access",
            "description": "Your line of work offers you special privileges. Once per assignment, automatically gain access to an important person or place by using the Press Credentials gear.",
            "selected": true
          },
          {
            "id": "ability-26",
            "name": "Open Book",
            "description": "You can get people to open up to you very quickly. When you attempt to connect with others by sharing something deeply personal, add a number of dice equal to your current Cunning resistance to a Sway roll. On a success, they will reciprocate.",
            "selected": false
          },
          {
            "id": "ability-30",
            "name": "Lie Detector",
            "description": "When you make a Read roll in an attempt to figure out whether a person is telling the truth, gild an additional die. The first Cunning you spend on the roll is worth +2d instead of +1d.",
            "selected": true
          },
          {
            "id": "ability-33",
            "name": "Press Conference",
            "description": "You can spend 1 Cunning to gather a large group of people together to make announcements, ask questions, or stage a distraction. All Cunning rolls you make at this assembly take +1d.",
            "selected": false
          },
          {
            "id": "ability-36",
            "name": "In the Trenches",
            "description": "You’ve done enough dangerous journalism work to know how to keep yourself safe. Once per assignment, you may burn 1 Cunning resistance to soak a Body mark.",
            "selected": false
          },
          {
            "id": "ability-39",
            "name": "Well-Researched",
            "description": "You can spend 1 Intuition to ask the GM a specific question about a place, group, or concept that you may have researched before the assignment. They will tell you what you know from that preparation.",
            "selected": false
          }
        ],
        "gear": [
          {
            "id": "gear-33",
            "name": "Bleed Detector",
            "selected": false
          },
          {
            "id": "gear-34",
            "name": "Hand Weapon",
            "selected": false
          },
          {
            "id": "gear-35",
            "name": "Bleed Containment Vial",
            "selected": false
          },
          {
            "id": "gear-36",
            "name": "Press Credentials",
            "selected": true
          },
          {
            "id": "gear-37",
            "name": "Camera",
            "selected": false
          },
          {
            "id": "gear-38",
            "name": "Surveillance Equipment",
            "selected": false
          }
        ],
        "relationships": [
          {
            "name": "Alistair Collins",
            "relation": "Dad"
          },
          {
            "name": "Evelyn Collins",
            "relation": "Mom"
          },
          {
            "name": "Edmund Collins",
            "relation": "Grandfather"
          },
          {
            "name": "Arthur Pendelton",
            "relation": "Boss"
          }
        ],
        "notes": "",
        "illuminationKeys": [
          "Gather Statements",
          "Hunt Down a Lead",
          "Speak Truth to Power"
        ],
        "illuminationKeyChecks": [],
        "version": 0,
        "sourceSheet": "Journalist (Keith)",
        "level": 2
      },
      "excallibur": {
        "id": "excallibur",
        "name": "Excallibur",
        "pronouns": "he/him",
        "role": "Muscle",
        "specialty": "Soldier",
        "style": "Lone Wolf/Mysterious/Closed Off",
        "catalyst": "By the eye of mamacoco",
        "question": "How did I get here?",
        "sourceCircle": "Circle of Judgement",
        "portrait": "./assets/excallibur.png",
        "actions": {
          "move": {
            "rating": 2,
            "gilded": false
          },
          "strike": {
            "rating": 2,
            "gilded": true
          },
          "control": {
            "rating": 1,
            "gilded": false
          },
          "sway": {
            "rating": 0,
            "gilded": false
          },
          "read": {
            "rating": 1,
            "gilded": false
          },
          "hide": {
            "rating": 2,
            "gilded": true
          },
          "survey": {
            "rating": 1,
            "gilded": false
          },
          "focus": {
            "rating": 0,
            "gilded": false
          },
          "sense": {
            "rating": 0,
            "gilded": false
          }
        },
        "drives": {
          "nerve": {
            "current": 2,
            "max": 3,
            "resistance": 1
          },
          "cunning": {
            "current": 3,
            "max": 4,
            "resistance": 1
          },
          "intuition": {
            "current": 2,
            "max": 2,
            "resistance": 0
          }
        },
        "marks": {
          "body": 0,
          "brain": 0,
          "bleed": 0
        },
        "scars": "",
        "abilities": [
          {
            "id": "ability-11",
            "name": "Behind Me",
            "description": "Spend 1 Nerve to choose an ally in the same area as you who is about to take a mark from a phenomenon. Describe what you do that allows you to take the mark instead.",
            "selected": false
          },
          {
            "id": "ability-14",
            "name": "Adrenaline Rush",
            "description": "For each mark you take, you may immediately refresh a drive point of your choice.",
            "selected": true
          },
          {
            "id": "ability-17",
            "name": "Endurance",
            "description": "When you take enough marks to become incapacitated, instead, roll a number of d6 equal to your current Nerve resistance. On a 6, you aren’t incapacitated and don’t take a scar.",
            "selected": false
          },
          {
            "id": "ability-23",
            "name": "Basic Training",
            "description": "You have tactical experience in high-pressure situations. When you make a Survey roll in a dangerous place, also add a number of dice equal to your current Nerve resistance.",
            "selected": false
          },
          {
            "id": "ability-26",
            "name": "Geared Up",
            "description": "You and one ally in your circle may mark an additional gear slot during each assignment.",
            "selected": false
          },
          {
            "id": "ability-29",
            "name": "Volunteer Duty",
            "description": "Between assignments, instead of spending resources, you can offer a helping hand to your Lightkeeper. Describe how you aid the organization, and refill 1 point in any Candela Obscura resource on your circle sheet. You may not spend any resources during this downtime.",
            "selected": true
          },
          {
            "id": "ability-32",
            "name": "Sharpshooter",
            "description": "When you want to make a ranged attack with a weapon, you may spend 1 Nerve to steady your aim before shooting, and add +2d to your next shot at this target.",
            "selected": true
          },
          {
            "id": "ability-35",
            "name": "Tactician",
            "description": "When you are in a dangerous scenario, you may spend 1 Nerve to ask the GM a question: How do I get to safety? What poses the largest immediate threat to my circle? Where is the target going to move next?",
            "selected": false
          },
          {
            "id": "ability-38",
            "name": "Compartmentalization",
            "description": "You have trained to detach yourself from the horrors of violence. Once per assignment, you may burn 1 Nerve resistance to soak a Brain mark.",
            "selected": false
          }
        ],
        "gear": [
          {
            "id": "gear-33",
            "name": "Bleed Detector",
            "selected": false
          },
          {
            "id": "gear-34",
            "name": "Hand Weapon",
            "selected": true
          },
          {
            "id": "gear-35",
            "name": "Bleed Containment Vial (Lead Lined Bag)",
            "selected": true
          },
          {
            "id": "gear-36",
            "name": "Heavy Weapon",
            "selected": false
          },
          {
            "id": "gear-37",
            "name": "Explosives",
            "selected": true
          },
          {
            "id": "gear-38",
            "name": "Body Armour (Soak 1 Body)",
            "selected": false
          }
        ],
        "relationships": [
          {
            "name": "Jack",
            "relation": "Arrested"
          },
          {
            "name": "Lightkeeper",
            "relation": ""
          }
        ],
        "notes": "",
        "illuminationKeys": [
          "Use Violence of Action",
          "Protect Someone",
          "Act Tactically"
        ],
        "illuminationKeyChecks": [],
        "version": 0,
        "sourceSheet": "Soldier (Excallibur)",
        "level": 2
      },
      "jack": {
        "id": "jack",
        "name": "Jack Robbins",
        "pronouns": "He/Him",
        "role": "Slink",
        "specialty": "Criminal",
        "style": "Reformed criminal (kind of). Charming, scrappy, clever, disloyal.",
        "catalyst": "The loved ones",
        "question": "Can I live a life my daughter wouldn't be ashamed of?",
        "sourceCircle": "",
        "portrait": ".assets/jack.png",
        "actions": {
          "move": {
            "rating": 1,
            "gilded": true
          },
          "strike": {
            "rating": 1,
            "gilded": false
          },
          "control": {
            "rating": 1,
            "gilded": false
          },
          "sway": {
            "rating": 1,
            "gilded": false
          },
          "read": {
            "rating": 0,
            "gilded": false
          },
          "hide": {
            "rating": 2,
            "gilded": true
          },
          "survey": {
            "rating": 1,
            "gilded": false
          },
          "focus": {
            "rating": 1,
            "gilded": false
          },
          "sense": {
            "rating": 1,
            "gilded": false
          }
        },
        "drives": {
          "nerve": {
            "current": 2,
            "max": 2,
            "resistance": 0
          },
          "cunning": {
            "current": 4,
            "max": 4,
            "resistance": 1
          },
          "intuition": {
            "current": 3,
            "max": 3,
            "resistance": 1
          }
        },
        "marks": {
          "body": 0,
          "brain": 0,
          "bleed": 0
        },
        "scars": "",
        "abilities": [
          {
            "id": "ability-11",
            "name": "Scout",
            "description": "If you have time to observe a location, you can spend 1 Intuition to ask a question: What do I notice here that others do not see? What in this place might be of use to us? What path should we follow?",
            "selected": false
          },
          {
            "id": "ability-14",
            "name": "Saw This Coming",
            "description": "Three times per assignment, you may add +1d to a circle member’s roll without spending drive by saying how you prepared for this kind of situation together.",
            "selected": false
          },
          {
            "id": "ability-17",
            "name": "Death Defy",
            "description": "Once per assignment, when you should take 1 or more marks from an enemy, you instead escape unscathed. Describe how your quick thinking keeps you safe from harm.",
            "selected": true
          },
          {
            "id": "ability-23",
            "name": "Street Smarts",
            "description": "You know how to keep an eye on your surroundings. Whenever you make a Survey roll, you may spend any drive instead of only using Intuition.",
            "selected": true
          },
          {
            "id": "ability-26",
            "name": "Leverage",
            "description": "On a successful Read roll, you may ask the GM what your target truly wants. On any Sway rolls you make using this information, also add your current Cunning resistance.",
            "selected": false
          },
          {
            "id": "ability-29",
            "name": "Hardened",
            "description": "When you take a scar, you may choose not to shift any\naction points as a result.",
            "selected": false
          },
          {
            "id": "ability-32",
            "name": "Born in the Shadows",
            "description": "When attempting to avoid security or detection, gild an additional Hide die.",
            "selected": false
          },
          {
            "id": "ability-35",
            "name": "Tricks of the Trade",
            "description": "You’ve learned how to navigate tricky or dangerous situations to keep yourself out of harm’s way. On any Hide or Sway roll you make, you may spend 1 Nerve to lower the stakes before rolling. If this is already a low-stakes roll, you may not use this ability.",
            "selected": false
          },
          {
            "id": "ability-38",
            "name": "Sticky Fingers",
            "description": "After a successful melee attack, you can spend\n1 Cunning to pilfer an item from your target undetected. This could be their wallet, a weapon they’re carrying, an important document, etc.",
            "selected": false
          }
        ],
        "gear": [
          {
            "id": "gear-33",
            "name": "Bleed Detector",
            "selected": false
          },
          {
            "id": "gear-34",
            "name": "Hand Weapon",
            "selected": false
          },
          {
            "id": "gear-35",
            "name": "Bleed Containment Vial",
            "selected": false
          },
          {
            "id": "gear-36",
            "name": "Forged documents",
            "selected": false
          },
          {
            "id": "gear-37",
            "name": "Burglary Equipment",
            "selected": false
          },
          {
            "id": "gear-38",
            "name": "Body Armor (Soak 1 Body)",
            "selected": false
          }
        ],
        "relationships": [
          {
            "name": "Excallibur",
            "relation": "Arresting Officer"
          },
          {
            "name": "Society",
            "relation": ""
          },
          {
            "name": "The guy i know",
            "relation": ""
          }
        ],
        "notes": "I Know A Guy: Once per assignment, ask the GM who you know nearby that could help you. They will give you a temporary contact, and explain why they might have insight into the investigation.",
        "illuminationKeys": [
          "Do Something Illegal",
          "Make A Deal",
          "Stand Up To Authority"
        ],
        "illuminationKeyChecks": [],
        "version": 0,
        "sourceSheet": "Criminal (Jack)",
        "level": 2
      },
      "camellya": {
        "id": "camellya",
        "name": "Camellya",
        "pronouns": "Her/She",
        "role": "Weird",
        "specialty": "Occultist",
        "style": "Sueve /Kafka/Jade",
        "catalyst": "The Dress",
        "question": "",
        "sourceCircle": "",
        "portrait": "./assets/camellya.png",
        "actions": {
          "move": {
            "rating": 1,
            "gilded": false
          },
          "strike": {
            "rating": 0,
            "gilded": false
          },
          "control": {
            "rating": 1,
            "gilded": false
          },
          "sway": {
            "rating": 2,
            "gilded": false
          },
          "read": {
            "rating": 1,
            "gilded": true
          },
          "hide": {
            "rating": 0,
            "gilded": false
          },
          "survey": {
            "rating": 0,
            "gilded": false
          },
          "focus": {
            "rating": 1,
            "gilded": true
          },
          "sense": {
            "rating": 2,
            "gilded": false
          }
        },
        "drives": {
          "nerve": {
            "current": 2,
            "max": 3,
            "resistance": 1
          },
          "cunning": {
            "current": 3,
            "max": 3,
            "resistance": 1
          },
          "intuition": {
            "current": 3,
            "max": 3,
            "resistance": 1
          }
        },
        "marks": {
          "body": 0,
          "brain": 0,
          "bleed": 0
        },
        "scars": "",
        "abilities": [
          {
            "id": "ability-11",
            "name": "Let Them In",
            "description": "Whenever you take one or more Bleed marks, you also gain additional information about the phenomenon that harmed you. Ask the GM a question about the source of the bleed.",
            "selected": false
          },
          {
            "id": "ability-14",
            "name": "Great Wards",
            "description": "You can inscribe and maintain a warding symbol on one person at a time. Describe the material they must hold to bind it (salt, sand, etc.). They take +1d on Move rolls against phenomena.",
            "selected": false
          },
          {
            "id": "ability-17",
            "name": "Ritual",
            "description": "When you have a few minutes to prepare, you may take a Bleed mark to perform a ritual on yourself or an ally:\nCircle of Protection (soaks 1 Body mark for the person within), Reinvigorate (refresh 1 resistance), or Remote Viewing (one moment).",
            "selected": true
          },
          {
            "id": "ability-23",
            "name": "Ghostblade",
            "description": "You can attune a ritual knife to yourself. If you coat it in your blood (take a Body mark), it can wound magickal beings and strike invisible or ethereal enemies.",
            "selected": false
          },
          {
            "id": "ability-26",
            "name": "Extend Your Senses",
            "description": "When you roll with Sense to understand more about a phenomenon you’ve encountered, also add a number of dice equal to your current Intuition resistance to the roll.",
            "selected": false
          },
          {
            "id": "ability-29",
            "name": "Blood of the Covenant",
            "description": "The first time a dangerous phenomenon inflicts a mark on anyone in your circle, you refresh a number of points, in any drive, equal to your current Intuition resistance.",
            "selected": false
          },
          {
            "id": "ability-32",
            "name": "Speak Their Language",
            "description": "You can speak the supernatural language of any phenomenon you encounter. Describe what strange or terrifying way you communicate with each other.",
            "selected": true
          },
          {
            "id": "ability-35",
            "name": "Play the Bait",
            "description": "You know how to draw the attention of a phenomenon—you just have to play the bait. Make a Sense roll to bring a nearby phenomenon toward you.",
            "selected": false
          },
          {
            "id": "ability-38",
            "name": "Forbidden Ritual",
            "description": "You know a highly complex and extremely dangerous ritual that will achieve a desired outcome. When you use this ritual, immediately take a Bleed scar. Determine what the ritual is and what its effects are: change the environment, conjure a phenomenon, or save a dying person.",
            "selected": false
          }
        ],
        "gear": [
          {
            "id": "gear-33",
            "name": "Bleed Detector",
            "selected": true
          },
          {
            "id": "gear-34",
            "name": "Hand Weapon",
            "selected": false
          },
          {
            "id": "gear-35",
            "name": "Bleed Containment Vial",
            "selected": false
          },
          {
            "id": "gear-36",
            "name": "Arcane Text",
            "selected": false
          },
          {
            "id": "gear-37",
            "name": "Ward (Soak 1 Bleed)",
            "selected": true
          },
          {
            "id": "gear-38",
            "name": "Occult Supplies",
            "selected": false
          }
        ],
        "relationships": [
          {
            "name": "Karina",
            "relation": "daughter"
          }
        ],
        "notes": "Violet Boucher - Adjuvant chemical to counteract bleed\n\nLeverage: On a successful Read roll, you may ask the GM what your target truly wants. On any Sway rolls you make using this information, also add your current Cunning resistance.",
        "illuminationKeys": [
          "Make a Scene",
          "Collect Oddities",
          "Act Bizarre"
        ],
        "illuminationKeyChecks": [],
        "version": 0,
        "sourceSheet": "Occultist (Camellya)",
        "level": 2
      }
    },
    "characterOrder": [
      "wysel",
      "keith",
      "excallibur",
      "jack",
      "camellya"
    ],
    "events": {},
    "sourceWorkbook": "Character Sheets for Candela Group The Prophets.xlsx",
    "sourceNotes": "The Circle Sheet has no Circle name, so this app uses The Prophets. Excallibur lists Circle of Judgement in his original sheet. Current drives, resistances and resources are imported exactly as recorded. The other seven tabs are unfilled character templates and are not seats.",
    "level": 2
  }
];
