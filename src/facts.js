/** Daily fun facts: one per day, no repeats until all have been shown. Not part of the score. */
import { daysBetween } from './date.js';

export const FACT_TOPICS = ['Physics', 'Science', 'Maths', 'Philosophy', 'History'];

const f = (n, topic, text, label, url) => ({
  id: `x${String(n).padStart(2, '0')}`, topic, text, source: url ? { label, url } : { label },
});

// Authored in a mixed topic order so consecutive days vary.
export const FACTS = [
  f(1, 'Physics', 'Sunlight takes about 8 minutes and 20 seconds to reach Earth. When you look at the Sun, you see it as it was 8 minutes ago.', 'NASA'),
  f(2, 'Maths', 'There are infinitely many prime numbers. Euclid proved it around 300 BCE with an argument still taught today.', 'Euclid, Elements, Book IX, Proposition 20'),
  f(3, 'Philosophy', 'Socrates never wrote anything down. Almost everything we know of his ideas comes from his student Plato.', 'Stanford Encyclopedia of Philosophy — Socrates', 'https://plato.stanford.edu/entries/socrates/'),
  f(4, 'Science', 'Your body holds roughly as many bacterial cells as human cells — about 38 trillion bacteria to 30 trillion human cells.', 'Sender, Fuchs & Milo (2016), PLoS Biology, 14(8):e1002533'),
  f(5, 'History', 'Ibn al-Haytham (c. 965–1040) showed that we see because light enters the eye, and tested his ideas with careful experiments.', 'UNESCO International Year of Light 2015 — Ibn al-Haytham'),
  f(6, 'Maths', 'In a room of just 23 people, there is a better than 50% chance that two share a birthday.', 'The birthday problem — standard probability result'),
  f(7, 'Physics', 'GPS satellites’ clocks run faster than clocks on the ground because of relativity. Without correcting about 38 microseconds a day, GPS would drift kilometres.', 'Ashby (2003), Living Reviews in Relativity, 6:1'),
  f(8, 'Philosophy', 'If every plank of a ship is replaced one by one, is it still the same ship? This puzzle, the Ship of Theseus, is over 1,900 years old.', 'Plutarch, Life of Theseus'),
  f(9, 'Science', 'Octopuses have three hearts and blue blood, which carries oxygen using copper instead of iron.', 'Smithsonian Ocean'),
  f(10, 'Maths', 'The word “algorithm” comes from the name of al-Khwarizmi, and “algebra” from his 9th-century book al-Jabr.', 'Encyclopaedia Britannica — al-Khwarizmi'),
  f(11, 'Physics', 'Sound travels about four times faster in water (≈1,480 m/s) than in air (≈343 m/s).', 'Standard physical constants'),
  f(12, 'History', 'Eratosthenes estimated Earth’s circumference around 240 BCE using only shadows, a well and geometry — and got remarkably close.', 'Encyclopaedia Britannica — Eratosthenes'),
  f(13, 'Science', 'Edible honey has been found in ancient Egyptian tombs. Its low water content and acidity keep microbes from growing.', 'Smithsonian Magazine (2013), “The Science Behind Honey’s Eternal Shelf Life”'),
  f(14, 'Philosophy', 'Marcus Aurelius wrote his Meditations as private notes to himself. He never meant them to be published.', 'Stanford Encyclopedia of Philosophy — Marcus Aurelius', 'https://plato.stanford.edu/entries/marcus-aurelius/'),
  f(15, 'Maths', 'A well-shuffled deck of 52 cards is almost certainly in an order no one has ever seen: there are about 8 × 10⁶⁷ possible orders.', '52! ≈ 8.07 × 10⁶⁷'),
  f(16, 'Physics', 'The Eiffel Tower grows up to about 15 cm taller in summer, as the iron expands in the heat.', 'Société d’Exploitation de la Tour Eiffel', 'https://www.toureiffel.paris/en'),
  f(17, 'Science', 'Tardigrades — animals under 1 mm long — have survived direct exposure to the vacuum of space.', 'Jönsson et al. (2008), Current Biology, 18(17):R729–R731'),
  f(18, 'Philosophy', 'In the 11th century, Ibn Sina imagined a man floating in the air with no senses, and argued he would still know that he exists.', 'Stanford Encyclopedia of Philosophy — Ibn Sina’s Psychology', 'https://plato.stanford.edu/entries/ibn-sina-psychology/'),
  f(19, 'Maths', 'Some infinities are bigger than others. Georg Cantor proved the real numbers cannot be listed one by one like the whole numbers.', 'Cantor (1891), diagonal argument'),
  f(20, 'Science', 'Your brain is about 2% of your body weight but uses about 20% of its energy.', 'Raichle & Gusnard (2002), PNAS, 99(16):10237–10239'),
  f(21, 'History', 'The first computer “bug” was a real moth, found stuck in the Harvard Mark II computer in 1947 and taped into the logbook.', 'Smithsonian National Museum of American History'),
  f(22, 'Physics', 'A bolt of lightning can heat the air to about 30,000 °C — roughly five times hotter than the surface of the Sun.', 'US National Weather Service', 'https://www.weather.gov/safety/lightning-science-overview'),
  f(23, 'Maths', 'Fold a 0.1 mm sheet of paper in half 42 times and it would be about 440,000 km thick — farther than the Moon.', '0.1 mm × 2⁴² ≈ 440,000 km; Moon ≈ 384,400 km'),
  f(24, 'Philosophy', '“The unexamined life is not worth living,” Socrates told the court at his trial in 399 BCE.', 'Plato, Apology 38a'),
  f(25, 'Science', 'Sharks are older than trees. Sharks appear in the fossil record about 450 million years ago; trees about 385 million years ago.', 'Natural History Museum, London'),
  f(26, 'Physics', 'Atoms are almost entirely empty space. If a nucleus were a marble, the atom would be about the size of a football stadium.', 'CERN — The structure of matter'),
  f(27, 'Maths', '0.999… repeating forever is exactly equal to 1, not just very close to it.', 'Standard result: 1/3 = 0.333…, so 3 × 1/3 = 0.999… = 1'),
  f(28, 'Science', 'Water expands by about 9% when it freezes. That is why ice floats and why frozen pipes burst.', 'US Geological Survey', 'https://www.usgs.gov/special-topics/water-science-school'),
  f(29, 'History', 'In 628 CE, the Indian mathematician Brahmagupta wrote rules for calculating with zero as a number in its own right.', 'Encyclopaedia Britannica — Brahmagupta'),
  f(30, 'Philosophy', 'Occam’s razor — prefer the simplest explanation that fits — is named after William of Ockham, a 14th-century English friar.', 'Stanford Encyclopedia of Philosophy — William of Ockham', 'https://plato.stanford.edu/entries/ockham/'),
  f(31, 'Physics', 'A day on Venus (243 Earth days) is longer than its year (225 Earth days).', 'NASA — Venus facts', 'https://science.nasa.gov/venus/'),
  f(32, 'Science', 'The DNA in a single human cell, stretched out, would be about 2 metres long.', 'US National Human Genome Research Institute'),
  f(33, 'Maths', 'In the Monty Hall game, switching doors wins 2 times out of 3. Many mathematicians refused to believe it at first.', 'Selvin (1975), The American Statistician, 29(1):67'),
  f(34, 'Philosophy', 'The Stoic philosopher Epictetus was born a slave. He taught that we control only our own judgments and choices.', 'Stanford Encyclopedia of Philosophy — Epictetus', 'https://plato.stanford.edu/entries/epictetus/'),
  f(35, 'Science', 'Rafflesia, which grows in Malaysia’s rainforests, has the largest single flower on Earth — Rafflesia arnoldii can reach about 1 metre across.', 'Royal Botanic Gardens, Kew'),
  f(36, 'Physics', 'Saturn is less dense than water. In a bathtub big enough, it would float.', 'NASA — Saturn facts', 'https://science.nasa.gov/saturn/'),
  f(37, 'History', 'Ibn Khaldun’s Muqaddimah (1377) studied how societies rise and fall, and is often called a forerunner of sociology and economics.', 'Encyclopaedia Britannica — Ibn Khaldun'),
  f(38, 'Maths', 'Sunflower seed heads usually spiral in Fibonacci numbers, such as 34 one way and 55 the other.', 'Swinton et al. (2016), Royal Society Open Science, 3:160091'),
  f(39, 'Philosophy', 'Descartes’ “I think, therefore I am” first appeared in French — “Je pense, donc je suis” — in 1637, not in Latin.', 'Descartes, Discourse on the Method (1637), Part IV'),
  f(40, 'Science', 'While you sleep, your brain clears out waste products much faster than when you are awake.', 'Xie et al. (2013), Science, 342(6156):373–377'),
  f(41, 'Physics', 'Bananas are very slightly radioactive, because they contain potassium-40. You would need to eat millions at once for it to matter.', 'Health Physics Society'),
  f(42, 'Maths', 'Euler’s identity, e^(iπ) + 1 = 0, links five of the most important numbers in mathematics in one short equation.', 'Euler (1748), Introductio in analysin infinitorum'),
  f(43, 'History', 'Alexander Fleming discovered penicillin in 1928 after noticing that mould on a forgotten dish had killed the bacteria around it.', 'Encyclopaedia Britannica — Alexander Fleming'),
  f(44, 'Philosophy', 'Zeno argued that a runner can never finish a race, since he must first cover half the distance, then half the rest, forever. Infinite sums resolve it.', 'Stanford Encyclopedia of Philosophy — Zeno’s Paradoxes', 'https://plato.stanford.edu/entries/paradox-zeno/'),
  f(45, 'Science', 'Trees in a forest can pass carbon to each other through underground fungal networks.', 'Simard et al. (1997), Nature, 388:579–582'),
  f(46, 'Physics', 'The coldest possible temperature is absolute zero: −273.15 °C. Nothing can be cooled below it.', 'NIST'),
  f(47, 'Maths', 'In many real-world lists of numbers, about 30% start with the digit 1 — not 11% as you might guess. This is Benford’s law.', 'Benford (1938), Proceedings of the American Philosophical Society, 78(4):551–572'),
  f(48, 'Philosophy', 'Al-Ghazali argued in the 11th century that we never actually observe causes, only one event following another — an idea often compared to Hume’s.', 'Stanford Encyclopedia of Philosophy — al-Ghazali', 'https://plato.stanford.edu/entries/al-ghazali/'),
  f(49, 'Science', 'The human eye can sometimes detect a single photon of light.', 'Tinsley et al. (2016), Nature Communications, 7:12172'),
  f(50, 'History', 'In 9th-century Baghdad, the Banu Musa brothers described an automatic flute player — often called the first programmable machine.', 'Koetsier (2001), Mechanism and Machine Theory, 36(5):589–603'),
  f(51, 'Physics', 'Astronauts grow up to about 3% taller in space, because their spines are no longer squeezed by gravity.', 'NASA'),
  f(52, 'Maths', 'Getting 1% better every day for a year makes you about 37.8 times better (1.01³⁶⁵). Getting 1% worse leaves you at 0.03.', '1.01³⁶⁵ ≈ 37.78; 0.99³⁶⁵ ≈ 0.026'),
  f(53, 'Philosophy', 'The trolley problem — would you divert a runaway trolley to kill one instead of five? — was introduced by Philippa Foot in 1967.', 'Foot (1967), Oxford Review, 5:5–15'),
  f(54, 'Science', 'Humans and chimpanzees share about 98.8% of their DNA.', 'Smithsonian National Museum of Natural History'),
  f(55, 'Maths', 'Pi has been calculated to more than 100 trillion digits — but about 40 digits are enough to measure the observable universe to the width of an atom.', 'Google Cloud (2022); NASA JPL'),
  f(56, 'Philosophy', 'The word “philosophy” comes from Greek and means “love of wisdom”.', 'Oxford English Dictionary'),
  f(57, 'History', 'The idea of kaizen — continuous small improvement — became famous through Toyota’s factories after World War II.', 'Imai (1986), Kaizen: The Key to Japan’s Competitive Success'),
  f(58, 'Maths', 'Kepler guessed in 1611 that stacking oranges in a pyramid is the densest way to pack spheres. It took until 2017 to formally prove it.', 'Hales et al. (2017), Forum of Mathematics, Pi, 5:e2'),
  f(59, 'Physics', 'Hot water can sometimes freeze faster than cold water. It is called the Mpemba effect, and physicists still debate why.', 'Mpemba & Osborne (1969), Physics Education, 4(3):172'),
  f(60, 'Science', 'A teaspoon of material from a neutron star would weigh about a billion tonnes on Earth.', 'NASA — Neutron stars'),
];

const REFERENCE_DAY = '2026-01-01';

/** The fact for a calendar day. Cycles through every fact before repeating. @param {string} key */
export function factForDay(key) {
  const n = FACTS.length;
  const i = ((daysBetween(REFERENCE_DAY, key) % n) + n) % n;
  return FACTS[i];
}
