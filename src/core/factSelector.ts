import type { LanguageCode } from "../i18n";
import { didYouKnowFacts, getFactText } from "../data/didYouKnowFacts";

const usedFactsByCountry = new Map<string, Set<string>>();
const lastFactByCountry = new Map<string, string>();

export function getRandomFact(country: string, language: LanguageCode) {
  const facts = didYouKnowFacts.filter((fact) => fact.country === country);
  if (!facts.length) {
    return "";
  }

  let used = usedFactsByCountry.get(country);
  if (!used) {
    used = new Set<string>();
    usedFactsByCountry.set(country, used);
  }

  let available = facts.filter((fact) => !used.has(fact.id));
  if (!available.length) {
    used.clear();
    available = [...facts];
  }

  const lastFactId = lastFactByCountry.get(country);
  if (available.length > 1 && lastFactId) {
    const withoutLast = available.filter((fact) => fact.id !== lastFactId);
    if (withoutLast.length) {
      available = withoutLast;
    }
  }

  const selected = available[Math.floor(Math.random() * available.length)] ?? facts[0];
  used.add(selected.id);
  lastFactByCountry.set(country, selected.id);
  return getFactText(selected, language);
}
