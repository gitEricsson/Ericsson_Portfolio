import Readout from "./Readout";
import SplitReveal from "./SplitReveal";

type Props = {
  index: string;
  label: string;
  title: string;
  className?: string;
  align?: "left" | "right";
};

/**
 * Chapter opener: readout index + oversized title.
 * Alignment varies per chapter so the grammar never templates.
 */
export default function ChapterHead({
  index,
  label,
  title,
  className = "",
  align = "left",
}: Props) {
  return (
    <header
      className={`${align === "right" ? "text-right" : ""} ${className}`}
    >
      <Readout
        text={`${index} / ${label}`}
        className="mb-4 block text-ink-60"
      />
      <SplitReveal as="h2" mode="chars" className="type-chapter text-ink">
        {title}
      </SplitReveal>
    </header>
  );
}
