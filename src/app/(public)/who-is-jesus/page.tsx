import { BookOpenIcon, CrossIcon, HeartHandshakeIcon, SunriseIcon } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Who is Jesus?",
  description:
    "Who Jesus is, what he did, and why it matters: a short introduction from the people behind this site.",
  path: "/who-is-jesus",
});

const story = [
  {
    icon: SunriseIcon,
    title: "He came",
    description:
      "Jesus of Nazareth was born in Bethlehem about two thousand years ago. The Bible says he is God the Son, who became fully human to live among us.",
    verse: "The Word became flesh and lived among us.",
    reference: "John 1:14",
  },
  {
    icon: HeartHandshakeIcon,
    title: "He lived",
    description:
      "He healed the sick, welcomed outsiders, forgave sinners and taught that the greatest command is to love God and love your neighbor.",
    verse: "I came that they may have life, and may have it abundantly.",
    reference: "John 10:10",
  },
  {
    icon: CrossIcon,
    title: "He died",
    description:
      "He was crucified under Pontius Pilate. Christians believe he willingly gave his life to pay for our sins and bring us back to God.",
    verse: "God so loved the world, that he gave his only born Son.",
    reference: "John 3:16",
  },
  {
    icon: BookOpenIcon,
    title: "He rose",
    description:
      "On the third day he rose from the dead and appeared to hundreds of witnesses. He offers forgiveness and new life to everyone who trusts him.",
    verse: "I am the resurrection and the life.",
    reference: "John 11:25",
  },
];

const nextSteps = [
  {
    title: "Read about him",
    description: "Start with the Gospel of John. It was written so that you may believe.",
  },
  {
    title: "Talk to him",
    description: "Prayer is simply talking to God. Be honest; he already knows your heart.",
  },
  {
    title: "Find a church",
    description: "Faith grows in community, just like your game grows with a good club.",
  },
];

export default function WhoIsJesusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Faith"
        title="Who is Jesus?"
        description="We love this game, but there's someone we love more. Here's a short introduction to the person at the center of our lives."
      />

      <section aria-labelledby="story" className="container-page py-16">
        <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-foreground/90">
          <h2 id="story" className="text-3xl font-bold text-court-deep">
            His story in four words
          </h2>
          <p>
            More people have followed Jesus than any other figure in history. Whatever you believe
            about him, his life is worth a closer look.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2">
          {story.map(({ icon: Icon, title, description, verse, reference }) => (
            <li key={title} className="flex flex-col rounded-2xl border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-ball text-court-deep">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-court-deep">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <blockquote className="mt-4 border-l-2 border-ball pl-4 text-sm text-foreground/80 italic">
                “{verse}”
                <footer className="mt-1 text-xs font-semibold text-court-deep not-italic">
                  {reference}
                </footer>
              </blockquote>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="next-steps" className="bg-muted/50">
        <div className="container-page py-16">
          <h2 id="next-steps" className="text-3xl font-bold text-court-deep">
            Want to know more?
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {nextSteps.map(({ title, description }, index) => (
              <li key={title} className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold tracking-wider text-court-deep/60 uppercase">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-court-deep">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-5">
              <a href="https://www.biblegateway.com/passage/?search=John+1&version=WEB">
                Read the Gospel of John
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/contact">Have questions? Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
