export function estimateReadingTime(text: string): number {
	const withoutCode = text
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/<[^>]+>/g, ' ');

	const japaneseChars =
		(withoutCode.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) || [])
			.length;
	const latinWords = (withoutCode.match(/[A-Za-z0-9]+/g) || []).length;
	const minutes = Math.ceil(japaneseChars / 400 + latinWords / 200);

	return Math.max(1, minutes);
}
