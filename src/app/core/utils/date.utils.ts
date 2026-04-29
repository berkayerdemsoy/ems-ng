/** <input type="datetime-local"> değerini backend ISO formatına çevirir */
export const toBackendDateTime = (htmlVal: string): string =>
  htmlVal.length === 16 ? `${htmlVal}:00` : htmlVal;

/** Backend ISO string'ini HTML datetime-local input'una çevirir */
export const toHtmlDatetimeLocal = (isoString: string): string =>
  isoString ? isoString.slice(0, 16) : '';

