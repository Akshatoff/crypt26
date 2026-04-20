import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMG = "https://placehold.co/800x450?text=Question+Image";

const questions = [
  {
    level: 0,
    content: `Warning! The following message is only authorized for NEW RECRUITS!
Unauthorized viewing of this message may lead to Life In Imprisonment.
Your life will no longer be yours.
🐧🐨🐧🐧🐨🐧🐧🐨🐗🐧🐨🐧🐨🐧🐨🐧🐧🐗🐧🐧🐨🐧🐧🐨🐨🐨🐗🐧🐨🐧🐨🐧🐧🐨🐨🐗🐧🐧🐨🐧🐧🐧🐧🐧🐗🐧🐨🐧🐧🐨🐧🐧🐨🐗🐧🐨🐧🐧🐨🐨🐧🐨🐗🐧🐨🐧🐨🐧🐧🐧🐧🐗🐧🐨🐧🐧🐨🐨🐨🐨🐗🐧🐨🐧🐨🐧🐧🐨🐧🐗🐧🐨🐧🐨🐧🐨🐧🐧🐗🐧🐨🐧🐧🐧🐧🐧🐨🐗🐧🐨🐧🐧🐨🐨🐨🐧🐗🐧🐨🐧🐨🐧🐨🐧🐧🐗🐧🐧🐨🐧🐧🐧🐧🐧🐗🐧🐨🐧🐧🐧🐨🐨🐧🐗🐧🐨🐧🐧🐨🐨🐨🐨`,
    answer: "lakekatwe",
    img: null,
  },
  {
    level: 1,
    content: "Decode the hidden message within the image.",
    answer: "jpsingh",
    img: PLACEHOLDER_IMG, // TODO: replace with real stegged Agatha Christie image URL
  },
  {
    level: 2,
    content: "Decode the hidden message within the image.",
    answer: "festival",
    img: PLACEHOLDER_IMG, // TODO: replace with real stegged image URL
  },
  {
    level: 3,
    content: `72 97 108 102 119 97 121 32 116 111 32 72 101 108 108 32 67 108 117 98
Fsn3LnWy`,
    answer: "guntersachs",
    img: null,
  },
  {
    level: 4,
    content: `Catalyst?   1-4; 2-1; 3-2; 4-1

https://drive.google.com/drive/folders/1IkT2dGsfajFRFpx3B21OaoIvAKw-6IPm?usp=sharing

In the alchemist's flask where rings embrace intruders bold,
Numbers from the first brew whisper winds from tropics cold.
Seek the next elixir's mark, where parallels of isles convene,
Merge their secrets north and west, no subtract, just sums between.
Beyond the Arctic's frozen gate, this spot crowns earth's extreme,
A hamlet clings where hunters dwell, ice whispers ancient dream.
In the forge where coders clash and versioned branches weave,
Hunt forge's hall with village tongue—its forks hold keys for sleuths who cleave.`,
    answer: "breakingbad",
    img: PLACEHOLDER_IMG, // TODO: replace with real image URL from Drive folder
  },
  {
    level: 5,
    content: `Pandora's box, Pandora's box, Pandora's box.
Where could you have been?
Searched for you and Found you.

Searched, above the lands and,
Beneath the sea, only to find dust and things,
Couldn't have imagined this place,
Probably in egypt, most probably in Greece,
Replace the god with the 2nd one and,
Find me the location, and the pandora will be yours.`,
    answer: "china",
    img: null,
  },
  {
    level: 6,
    content: `I speak without a voice, yet I call the storm.
Not first to enter, yet I open the door.
My presence is known only after I'm gone,
A ghost in the feed, but never the dawn.
I bend neither flame nor poison nor light,
Yet I steal your future mid-peek in a fight.
My gift is delay, my curse is reveal—
A whisper of time that your reflex can't feel
W9e856q6`,
    answer: "tetris",
    img: null,
  },
  {
    level: 7,
    content:
      "https://drive.google.com/drive/folders/1ii0RT7cr56JBvyoaZb8xHsIOwFzJYqV-",
    answer: "goat", // TODO: fill in answer
    img: null, // TODO: replace with real image URL from Drive folder
  },
  {
    level: 8,
    content:
      "https://drive.google.com/drive/folders/1thIDfO6NWv6bUddPkGD52L0ZMtmWf4P7?usp=sharing",
    answer: "cosmo",
    img: null, // TODO: replace with real image URL from Drive folder
  },
];

async function main() {
  console.log("❓ Seeding questions...\n");

  for (const q of questions) {
    await prisma.question.upsert({
      where: { level: q.level },
      update: { content: q.content, answer: q.answer, img: q.img },
      create: {
        level: q.level,
        content: q.content,
        answer: q.answer,
        img: q.img,
      },
    });
    console.log(
      `  ✓ Level ${String(q.level).padStart(2, "0")} → "${q.answer || "TBD"}"`,
    );
  }

  const total = await prisma.question.count();
  console.log(`\n✅ Done! ${total} questions in DB.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
