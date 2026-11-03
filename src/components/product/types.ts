import type { ChipTone, ProductSlug } from '../../data/products';

/** Section background, mapped to the global .section modifiers. */
export type SectionTone = 'plain' | 'tight' | 'card' | 'alt' | 'accent' | 'sand' | 'ink';

export interface Link {
  label: string;
  href: string;
}

/** A native <details class="route-evidence"> fold-out. */
export interface Foldout {
  summary: string;
  /** One paragraph, or several. */
  body: string | string[];
}

/** A status chip on an item: a product slug (chip from the registry) or free text. */
export type ItemChip = ProductSlug | { label: string; tone?: ChipTone };

export interface Item {
  title: string;
  text?: string;
  /** Makes the item a link (cards) or adds an arrow link (lists). Never link a draft product. */
  href?: string;
  /** Text of the arrow link in lists (FeatureList). Default: the item's title. */
  linkLabel?: string;
  chip?: ItemChip;
}

export interface StepItem {
  title: string;
  text?: string;
}

export function sectionClass(tone: SectionTone = 'plain'): string {
  return tone === 'plain' ? 'section' : `section section--${tone}`;
}

export function paragraphs(body?: string | string[]): string[] {
  if (!body) return [];
  return Array.isArray(body) ? body : [body];
}
