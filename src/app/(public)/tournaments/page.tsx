import { permanentRedirect } from "next/navigation";

/** Tournaments are listed on the events page; each one keeps its own /tournaments/[slug] page. */
export default function TournamentsPage() {
  permanentRedirect("/events");
}
