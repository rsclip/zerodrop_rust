use std::collections::HashMap;
use crate::rand_chacha::rand_core::SeedableRng;
use crate::rand_chacha::rand_core::RngCore;
use crate::rand_chacha;

const CHARS: [char; 13] = [
        '\u{2060}',
        '\u{2061}',
        '\u{2062}',
        '\u{2063}',
        '\u{206A}',
        '\u{206B}',
        '\u{206C}',
        '\u{206D}',
        '\u{206E}',
        '\u{206F}',
        '\u{200B}',
        '\u{200C}',
        '\u{200D}',
];

const SPACE: char = '\u{FEFF}'; // represents spaces
const SEP: char = '\u{200E}';   // separates each character

const ASCII: [char; 62] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/// Generates and represents a character set
/// from a pregiven seed
pub struct CharacterSet {
    seed: u64,
    pub set: HashMap<char, String>,
}

impl CharacterSet {
    pub fn new(seed: u64) -> CharacterSet {
        CharacterSet {
            seed,
            set: HashMap::new(),
        }
    }

    /// Embed a msg into an input based on this character set
    pub fn embed(&self, inp: String, msg: String) -> String {
        let point = self.range(
            0..inp.len(), 
            rand_chacha::ChaCha8Rng::seed_from_u64(self.seed + 1).next_u64()
        );

        format!(
            "{}{}{}",
            &inp[..point],
            self.translate(msg),
            &inp[point..],
        )
    }

    /// Translate a msg to hidden chars based on this charset
    fn translate(&self, msg: String) -> String {
        let mut rv = String::new();

        for c in msg.chars() {
            rv.push_str(match self.set.get(&c) {
                Some(x) => x,
                _ => panic!("no char available")
            });
            rv.push(SEP);
        };

        rv
    }

    /// Generate a completely unique set based on the seed
    pub fn gen_set(&mut self) {
        let mut gen = rand_chacha::ChaCha8Rng::seed_from_u64(self.seed);

        for ch in ASCII {
            let mut code: Option<String> = None;

            loop {
                // make sure its invalid to continue the loop
                match &code {
                    Some(x) => {
                        if !self.has(x) {
                            // already has a valid code
                            break;
                        }
                    },
                    _ => {} // no code yet
                }

                let code_length = self.range(1..3, gen.next_u64());
                code = Some(self.gen_code(code_length, &mut gen));
            }

            self.set.insert(ch, match code {
                Some(x) => x,
                _ => panic!("no code char")
            });
        }

        self.set.insert(' ', SPACE.to_string());
    }

    fn gen_code(&self, length: usize, gen: &mut rand_chacha::ChaCha8Rng) -> String {
        let mut code = String::new();

        for _ in 0..length {
            code.push(
                CHARS[
                    self.range(0..12, gen.next_u64())
                ]
            );
        };

        code
    }

    /// Using a random u64, select a random number from usize..usize
    fn range(&self, rng: std::ops::Range<usize>, num: u64) -> usize {
        let upper = rng.end as f32;
        let num = num as f32;
        let max = u64::MAX as f32;

        let dec = num / max * upper;
        dec.round() as usize
    }

    /// Check if a code has already been used
    fn has(&self, code: &String) -> bool {
        self.set
            .values()
            .any(|x| x == code)
    }
}