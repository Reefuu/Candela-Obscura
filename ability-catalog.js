// Ability names from the official character sheets; existing descriptions come from your workbook.
export const ABILITY_REFERENCE_URL = 'https://darringtonpress.com/wp-content/uploads/2024/06/CO_Character-Circle-Sheets_Interactive.pdf';
export const ABILITY_CATALOG = [
  {
    "id": "catalog-i-know-a-guy",
    "name": "I Know a Guy",
    "role": "Face",
    "specialty": "",
    "description": "Once per assignment, ask the GM who you know nearby that could help you. They will give you a temporary contact, and explain why they might have insight into the investigation.",
    "referencePage": 1
  },
  {
    "id": "catalog-insider-access",
    "name": "Insider Access",
    "role": "Face",
    "specialty": "Journalist",
    "description": "Your line of work offers you special privileges. Once per assignment, automatically gain access to an important person or place by using the Press Credentials gear.",
    "referencePage": 1
  },
  {
    "id": "catalog-sweet-talk",
    "name": "Sweet Talk",
    "role": "Face",
    "specialty": "",
    "description": "You know how to work the room. After you make small talk with someone, you may add +1d on any Read rolls you make in which they are the target. If your current Cunning resistance is 2 or higher, that die is gilded.",
    "referencePage": 1
  },
  {
    "id": "catalog-open-book",
    "name": "Open Book",
    "role": "Face",
    "specialty": "Journalist",
    "description": "You can get people to open up to you very quickly. When you attempt to connect with others by sharing something deeply personal, add a number of dice equal to your current Cunning resistance to a Sway roll. On a success, they will reciprocate.",
    "referencePage": 1
  },
  {
    "id": "catalog-lie-detector",
    "name": "Lie Detector",
    "role": "Face",
    "specialty": "Journalist",
    "description": "When you make a Read roll in an attempt to figure out whether a person is telling the truth, gild an additional die. The first Cunning you spend on the roll is worth +2d instead of +1d.",
    "referencePage": 1
  },
  {
    "id": "catalog-press-conference",
    "name": "Press Conference",
    "role": "Face",
    "specialty": "Journalist",
    "description": "You can spend 1 Cunning to gather a large group of people together to make announcements, ask questions, or stage a distraction. All Cunning rolls you make at this assembly take +1d.",
    "referencePage": 1
  },
  {
    "id": "catalog-in-the-trenches",
    "name": "In the Trenches",
    "role": "Face",
    "specialty": "Journalist",
    "description": "You’ve done enough dangerous journalism work to know how to keep yourself safe. Once per assignment, you may burn 1 Cunning resistance to soak a Body mark.",
    "referencePage": 1
  },
  {
    "id": "catalog-cool-under-pressure",
    "name": "Cool Under Pressure",
    "role": "Face",
    "specialty": "",
    "description": "On any high-stakes roll, you may always spend Cunning instead of the drive the action falls under.",
    "referencePage": 1
  },
  {
    "id": "catalog-well-researched",
    "name": "Well-Researched",
    "role": "Face",
    "specialty": "Journalist",
    "description": "You can spend 1 Intuition to ask the GM a specific question about a place, group, or concept that you may have researched before the assignment. They will tell you what you know from that preparation.",
    "referencePage": 1
  },
  {
    "id": "catalog-misdirection",
    "name": "Misdirection",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-escape-artist",
    "name": "Escape Artist",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-practiced-patter",
    "name": "Practiced Patter",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-uncanny-eye",
    "name": "Uncanny Eye",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-flourish",
    "name": "Flourish",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-the-prestige",
    "name": "The Prestige",
    "role": "Face",
    "specialty": "Magician",
    "description": "",
    "referencePage": 2
  },
  {
    "id": "catalog-behind-me",
    "name": "Behind Me",
    "role": "Muscle",
    "specialty": "",
    "description": "Spend 1 Nerve to choose an ally in the same area as you who is about to take a mark from a phenomenon. Describe what you do that allows you to take the mark instead.",
    "referencePage": 3
  },
  {
    "id": "catalog-obscure-lexicon",
    "name": "Obscure Lexicon",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-adrenaline-rush",
    "name": "Adrenaline Rush",
    "role": "Muscle",
    "specialty": "",
    "description": "For each mark you take, you may immediately refresh a drive point of your choice.",
    "referencePage": 3
  },
  {
    "id": "catalog-field-experience",
    "name": "Field Experience",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-mind-over-matter",
    "name": "Mind Over Matter",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-tenacious",
    "name": "Tenacious",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-narrow-escape",
    "name": "Narrow Escape",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-not-again",
    "name": "Not Again",
    "role": "Muscle",
    "specialty": "Explorer",
    "description": "",
    "referencePage": 3
  },
  {
    "id": "catalog-endurance",
    "name": "Endurance",
    "role": "Muscle",
    "specialty": "",
    "description": "When you take enough marks to become incapacitated, instead, roll a number of d6 equal to your current Nerve resistance. On a 6, you aren’t incapacitated and don’t take a scar.",
    "referencePage": 3
  },
  {
    "id": "catalog-basic-training",
    "name": "Basic Training",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "You have tactical experience in high-pressure situations. When you make a Survey roll in a dangerous place, also add a number of dice equal to your current Nerve resistance.",
    "referencePage": 4
  },
  {
    "id": "catalog-geared-up",
    "name": "Geared Up",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "You and one ally in your circle may mark an additional gear slot during each assignment.",
    "referencePage": 4
  },
  {
    "id": "catalog-sharpshooter",
    "name": "Sharpshooter",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "When you want to make a ranged attack with a weapon, you may spend 1 Nerve to steady your aim before shooting, and add +2d to your next shot at this target.",
    "referencePage": 4
  },
  {
    "id": "catalog-tactician",
    "name": "Tactician",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "When you are in a dangerous scenario, you may spend 1 Nerve to ask the GM a question: How do I get to safety? What poses the largest immediate threat to my circle? Where is the target going to move next?",
    "referencePage": 4
  },
  {
    "id": "catalog-compartmentalization",
    "name": "Compartmentalization",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "You have trained to detach yourself from the horrors of violence. Once per assignment, you may burn 1 Nerve resistance to soak a Brain mark.",
    "referencePage": 4
  },
  {
    "id": "catalog-volunteer-duty",
    "name": "Volunteer Duty",
    "role": "Muscle",
    "specialty": "Soldier",
    "description": "Between assignments, instead of spending resources, you can offer a helping hand to your Lightkeeper. Describe how you aid the organization, and refill 1 point in any Candela Obscura resource on your circle sheet. You may not spend any resources during this downtime.",
    "referencePage": 4
  },
  {
    "id": "catalog-patch-up",
    "name": "Patch Up",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-non-combatant",
    "name": "Non-Combatant",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-dissection",
    "name": "Dissection",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-resuscitation",
    "name": "Resuscitation",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-lifesaver",
    "name": "Lifesaver",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-anatomical-strike",
    "name": "Anatomical Strike",
    "role": "Scholar",
    "specialty": "Doctor",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-well-read",
    "name": "Well-Read",
    "role": "Scholar",
    "specialty": "",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-occult-researcher",
    "name": "Occult Researcher",
    "role": "Scholar",
    "specialty": "",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-meticulous-notes",
    "name": "Meticulous Notes",
    "role": "Scholar",
    "specialty": "",
    "description": "",
    "referencePage": 5
  },
  {
    "id": "catalog-steel-mind",
    "name": "Steel Mind",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-university-resources",
    "name": "University Resources",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-learn-from-my-mistakes",
    "name": "Learn from My Mistakes",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-better-part-of-valor",
    "name": "Better Part of Valor",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-verbose",
    "name": "Verbose",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-chemical-concoction",
    "name": "Chemical Concoction",
    "role": "Scholar",
    "specialty": "Professor",
    "description": "",
    "referencePage": 6
  },
  {
    "id": "catalog-scout",
    "name": "Scout",
    "role": "Slink",
    "specialty": "",
    "description": "If you have time to observe a location, you can spend 1 Intuition to ask a question: What do I notice here that others do not see? What in this place might be of use to us? What path should we follow?",
    "referencePage": 7
  },
  {
    "id": "catalog-street-smarts",
    "name": "Street Smarts",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "You know how to keep an eye on your surroundings. Whenever you make a Survey roll, you may spend any drive instead of only using Intuition.",
    "referencePage": 7
  },
  {
    "id": "catalog-saw-this-coming",
    "name": "Saw This Coming",
    "role": "Slink",
    "specialty": "",
    "description": "Three times per assignment, you may add +1d to a circle member’s roll without spending drive by saying how you prepared for this kind of situation together.",
    "referencePage": 7
  },
  {
    "id": "catalog-leverage",
    "name": "Leverage",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "On a successful Read roll, you may ask the GM what your target truly wants. On any Sway rolls you make using this information, also add your current Cunning resistance.",
    "referencePage": 7
  },
  {
    "id": "catalog-hardened",
    "name": "Hardened",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "When you take a scar, you may choose not to shift any\naction points as a result.",
    "referencePage": 7
  },
  {
    "id": "catalog-born-in-the-shadows",
    "name": "Born in the Shadows",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "When attempting to avoid security or detection, gild an additional Hide die.",
    "referencePage": 7
  },
  {
    "id": "catalog-tricks-of-the-trade",
    "name": "Tricks of the Trade",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "You’ve learned how to navigate tricky or dangerous situations to keep yourself out of harm’s way. On any Hide or Sway roll you make, you may spend 1 Nerve to lower the stakes before rolling. If this is already a low-stakes roll, you may not use this ability.",
    "referencePage": 7
  },
  {
    "id": "catalog-death-defy",
    "name": "Death Defy",
    "role": "Slink",
    "specialty": "",
    "description": "Once per assignment, when you should take 1 or more marks from an enemy, you instead escape unscathed. Describe how your quick thinking keeps you safe from harm.",
    "referencePage": 7
  },
  {
    "id": "catalog-sticky-fingers",
    "name": "Sticky Fingers",
    "role": "Slink",
    "specialty": "Criminal",
    "description": "After a successful melee attack, you can spend\n1 Cunning to pilfer an item from your target undetected. This could be their wallet, a weapon they’re carrying, an important document, etc.",
    "referencePage": 7
  },
  {
    "id": "catalog-mind-palace",
    "name": "Mind Palace",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-interrogation",
    "name": "Interrogation",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-back-against-the-wall",
    "name": "Back Against the Wall",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-inspection",
    "name": "Inspection",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-stakeout",
    "name": "Stakeout",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-one-step-ahead",
    "name": "One Step Ahead",
    "role": "Slink",
    "specialty": "Detective",
    "description": "",
    "referencePage": 8
  },
  {
    "id": "catalog-miasma",
    "name": "Miasma",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-bending-spoons",
    "name": "Bending Spoons",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-cold-read",
    "name": "Cold Read",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-premonitions",
    "name": "Premonitions",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-last-moments",
    "name": "Last Moments",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-commune",
    "name": "Commune",
    "role": "Weird",
    "specialty": "Medium",
    "description": "",
    "referencePage": 9
  },
  {
    "id": "catalog-great-wards",
    "name": "Great Wards",
    "role": "Weird",
    "specialty": "",
    "description": "You can inscribe and maintain a warding symbol on one person at a time. Describe the material they must hold to bind it (salt, sand, etc.). They take +1d on Move rolls against phenomena.",
    "referencePage": 9
  },
  {
    "id": "catalog-let-them-in",
    "name": "Let Them In",
    "role": "Weird",
    "specialty": "",
    "description": "Whenever you take one or more Bleed marks, you also gain additional information about the phenomenon that harmed you. Ask the GM a question about the source of the bleed.",
    "referencePage": 9
  },
  {
    "id": "catalog-ritual",
    "name": "Ritual",
    "role": "Weird",
    "specialty": "",
    "description": "When you have a few minutes to prepare, you may take a Bleed mark to perform a ritual on yourself or an ally:\nCircle of Protection (soaks 1 Body mark for the person within), Reinvigorate (refresh 1 resistance), or Remote Viewing (one moment).",
    "referencePage": 9
  },
  {
    "id": "catalog-ghostblade",
    "name": "Ghostblade",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "You can attune a ritual knife to yourself. If you coat it in your blood (take a Body mark), it can wound magickal beings and strike invisible or ethereal enemies.",
    "referencePage": 10
  },
  {
    "id": "catalog-blood-of-the-covenant",
    "name": "Blood of the Covenant",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "The first time a dangerous phenomenon inflicts a mark on anyone in your circle, you refresh a number of points, in any drive, equal to your current Intuition resistance.",
    "referencePage": 10
  },
  {
    "id": "catalog-speak-their-language",
    "name": "Speak Their Language",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "You can speak the supernatural language of any phenomenon you encounter. Describe what strange or terrifying way you communicate with each other.",
    "referencePage": 10
  },
  {
    "id": "catalog-play-the-bait",
    "name": "Play the Bait",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "You know how to draw the attention of a phenomenon—you just have to play the bait. Make a Sense roll to bring a nearby phenomenon toward you.",
    "referencePage": 10
  },
  {
    "id": "catalog-forbidden-ritual",
    "name": "Forbidden Ritual",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "You know a highly complex and extremely dangerous ritual that will achieve a desired outcome. When you use this ritual, immediately take a Bleed scar. Determine what the ritual is and what its effects are: change the environment, conjure a phenomenon, or save a dying person.",
    "referencePage": 10
  },
  {
    "id": "catalog-extend-your-senses",
    "name": "Extend Your Senses",
    "role": "Weird",
    "specialty": "Occultist",
    "description": "When you roll with Sense to understand more about a phenomenon you’ve encountered, also add a number of dice equal to your current Intuition resistance to the roll.",
    "referencePage": 10
  }
];

export const abilityKey = name => String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function abilityChoices(character) {
  const existing = new Map((character.abilities || []).map(a => [abilityKey(a.name), a]));
  const choices = ABILITY_CATALOG.map(a => {
    const saved = existing.get(abilityKey(a.name));
    existing.delete(abilityKey(a.name));
    return { ...a, ...saved, role:a.role, specialty:a.specialty, referencePage:a.referencePage, selected:Boolean(saved?.selected) };
  });
  return [...choices, ...existing.values()].sort((a,b) => (a.role || "").localeCompare(b.role || "") || (a.specialty || "").localeCompare(b.specialty || "") || a.name.localeCompare(b.name));
}
