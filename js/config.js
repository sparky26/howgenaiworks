export const STEP_COLORS = [
    '#4a9eff', // Step 1: Raw Text - blue
    '#00d4ff', // Step 2: Tokenization - cyan
    '#a855f7', // Step 3: Embeddings - purple
    '#ec4899', // Step 4: Relationships - pink
    '#22c55e', // Step 5: Prediction - green
    '#f97316', // Step 6: Scaling - orange
    '#fbbf24', // Step 7: Conclusion - gold
];

export const STEP_NAMES = [
    'Raw Text',
    'Breaking It Down',
    'Meaning as Numbers',
    'Finding Connections',
    'Predicting Words',
    'Scale',
    'Key Takeaways',
];

export const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Every morning, the fox would leap across the meadow, chasing patterns in the tall grass.";

export const TOKENS = [
    { text: 'The', id: 464 },
    { text: 'quick', id: 4996 },
    { text: 'brown', id: 11876 },
    { text: 'fox', id: 21831 },
    { text: 'jumps', id: 35308 },
    { text: 'over', id: 2017 },
    { text: 'the', id: 262 },
    { text: 'lazy', id: 16931 },
    { text: 'dog', id: 9703 },
    { text: '.', id: 13 },
    { text: 'Every', id: 6109 },
    { text: 'morn', id: 2611, subword: true },
    { text: 'ing', id: 278, subword: true },
    { text: ',', id: 11 },
    { text: 'the', id: 262 },
    { text: 'fox', id: 21831 },
    { text: 'would', id: 561 },
    { text: 'leap', id: 29210 },
    { text: 'across', id: 1973 },
    { text: 'the', id: 262 },
    { text: 'mead', id: 11252, subword: true },
    { text: 'ow', id: 322, subword: true },
    { text: ',', id: 11 },
    { text: 'chas', id: 25283, subword: true },
    { text: 'ing', id: 278, subword: true },
    { text: 'patterns', id: 7572 },
    { text: 'in', id: 287 },
    { text: 'the', id: 262 },
    { text: 'tall', id: 12896 },
    { text: 'grass', id: 10740 },
    { text: '.', id: 13 },
];

export const EMBEDDING_WORDS = [
    { word: 'fox', x: 0.72, y: 0.35, group: 'animal' },
    { word: 'dog', x: 0.68, y: 0.30, group: 'animal' },
    { word: 'cat', x: 0.75, y: 0.28, group: 'animal' },
    { word: 'king', x: 0.25, y: 0.70, group: 'royalty' },
    { word: 'queen', x: 0.30, y: 0.75, group: 'royalty' },
    { word: 'man', x: 0.20, y: 0.45, group: 'person' },
    { word: 'woman', x: 0.25, y: 0.50, group: 'person' },
    { word: 'jumps', x: 0.50, y: 0.60, group: 'action' },
    { word: 'leaps', x: 0.53, y: 0.62, group: 'action' },
    { word: 'runs', x: 0.48, y: 0.55, group: 'action' },
    { word: 'the', x: 0.85, y: 0.85, group: 'function' },
    { word: 'a', x: 0.88, y: 0.82, group: 'function' },
];

export const EMBEDDING_CONNECTIONS = [
    { from: 'fox', to: 'dog', label: '0.12' },
    { from: 'fox', to: 'cat', label: '0.15' },
    { from: 'king', to: 'queen', label: '0.18' },
    { from: 'man', to: 'woman', label: '0.14' },
    { from: 'jumps', to: 'leaps', label: '0.08' },
    { from: 'the', to: 'a', label: '0.10' },
];

export const PREDICTION_ROUNDS = [
    {
        input: 'The fox',
        predictions: [
            { word: 'jumps', prob: 0.34 },
            { word: 'ran', prob: 0.24 },
            { word: 'quickly', prob: 0.18 },
            { word: 'sat', prob: 0.08 },
            { word: 'is', prob: 0.06 },
            { word: 'other', prob: 0.10 },
        ],
        selected: 'jumps',
    },
    {
        input: 'The fox jumps',
        predictions: [
            { word: 'over', prob: 0.38 },
            { word: 'across', prob: 0.20 },
            { word: 'onto', prob: 0.16 },
            { word: 'high', prob: 0.10 },
            { word: 'through', prob: 0.09 },
            { word: 'other', prob: 0.07 },
        ],
        selected: 'over',
    },
    {
        input: 'The fox jumps over',
        predictions: [
            { word: 'the', prob: 0.52 },
            { word: 'a', prob: 0.18 },
            { word: 'every', prob: 0.08 },
            { word: 'some', prob: 0.07 },
            { word: 'that', prob: 0.06 },
            { word: 'other', prob: 0.09 },
        ],
        selected: 'the',
    },
];

export const NARRATIONS = {
    step1: `This is how language starts for a computer — as <em>raw text</em>. Just characters on a screen. The machine has no idea what these words mean. It cannot read. It has no concept of language, grammar, or meaning. Everything that follows is about turning this raw text into <em>math the machine can work with</em>.`,

    step2: `First, the text gets chopped into small pieces called <em>tokens</em>. Think of this as the AI's alphabet — but instead of single letters, tokens are common chunks of text. Notice that "morning" becomes "morn" + "ing" — the model works with <em>fragments, not whole words</em>. Every token is assigned a number. This is all the model ever sees: <em>a sequence of numbers</em>. Not words, not meaning — just numbers.`,

    step3: `Next, each token is converted into a long list of numbers called an <em>embedding</em> — typically hundreds or thousands of values. These numbers are not hand-coded; they are <em>learned from massive amounts of text</em> during training. The key insight: words that appear in similar contexts end up with similar numbers. "Fox" and "dog" cluster together, not because the model knows what animals are, but because they <em>appear near the same words</em> in training data.`,

    step4: `The model discovers <em>patterns and relationships</em> between words — purely from data, not from rules anyone programmed. It learns that "king" relates to "queen" the same way "man" relates to "woman." It also learns which words in a sentence are relevant to each other — this is called <em>attention</em>. For example, in "The fox jumps over the lazy dog," the model learns that "jumps" is strongly connected to "fox." <em>No human taught it grammar.</em> It found these patterns on its own.`,

    step5: `This is the core of how AI generates text: given the words so far, it <em>calculates a probability for every possible next word</em>. It does not "know" that foxes jump — it has seen billions of sentences where "jumps" follows "the fox." It then <em>randomly samples</em> from these probabilities. This is why the same prompt can produce different answers each time. The "temperature" setting controls how random the selection is — <em>lower means more predictable, higher means more varied but less reliable</em>. This is also why AI can sound confident while being completely wrong.`,

    step6: `Everything you have seen so far is simple math. What makes it powerful is <em>doing it at enormous scale</em>. Stack this process <em>96 layers deep</em>. Give the model <em>175 billion adjustable numbers</em> (parameters) to tune. Feed it trillions of words of training data. The result is not intelligence — it is an extraordinarily capable <em>pattern-matching machine</em>. It produces text that reads as if a human wrote it, but the process behind it is <em>purely mathematical</em>.`,

    step7: `Generative AI is <em>statistical pattern matching</em> operating at massive scale. It does not understand, reason, or have intent. Knowing this matters for your work: it means AI outputs should be <em>verified, not trusted</em>. It can produce plausible-sounding text that is factually wrong. Its outputs depend on what was in its training data — which may contain biases or gaps. Used well, it is a powerful tool. Used without scrutiny, it is a <em>source of risk</em>.`,
};
