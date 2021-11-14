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
#[derive(Debug)]
pub struct CharacterSet {
    seed: u64,
    pub set: HashMap<char, String>,
    pub revset: HashMap<String, char>,
}

impl CharacterSet {
    pub fn new(seed: u64) -> CharacterSet {
        CharacterSet {
            seed,
            set: HashMap::new(),
            revset: HashMap::new(), // reversed key values
        }
    }

    /// Embed a msg into an input based on this character set
    pub fn embed(&self, inp: String, msg: String) -> Result<String, String> {
        let point = self.range(
            0..inp.len(), 
            rand_chacha::ChaCha8Rng::seed_from_u64(self.seed + 1).next_u64()
        );

        Ok(format!(
            "{}{}{}",
            &inp[..point],
            self.translate(msg),
            &inp[point..],
        ))
    }

    /// Extract the hidden message
    pub fn extract(&self, inp: String) -> Result<String, String> {
        let mut encoded = String::new();

        let mut built_chars = String::new();

        for (_, character) in inp.char_indices() {
            println!("analysing '{}'", character);
            if character == SEP {
                println!("char is separator, built_chars has {} chars", built_chars.len());
                // all previous chars (built_chars) is 1 code
                let new_char = match self.revset.get(&built_chars) {
                    Some(x) => *x,
                    None => {return Err(format!("Code '{}' does not have an ASCII char associated with it", built_chars));},
                };

                println!("evaluated new char: {}", new_char);

                encoded.push(new_char);
                built_chars.clear();
            } else if self.char_is_invisible(&character) || character == SPACE {
                // some are spaces
                println!("char is invisible or space");
                built_chars.push(character);
            } else {
                println!("char does not match any if statements");
            }

            println!("encoded: {}, built_chars: {}", encoded, built_chars.len());
        };

        Ok(encoded)
    }

    fn char_is_invisible(&self, character: &char) -> bool {
        CHARS.iter().any(|x| x == character)
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
        let empty = Some("".to_string());

        for ch in ASCII {
            println!("Generating code for char {}", ch);
            let mut code: Option<String> = None;

            loop {
                // make sure its invalid to continue the loop
                match &code {
                    Some(x) => {
                        if !self.has(x) && &code != &empty {
                            // already has a valid code
                            println!("[{}] has a valid code", ch);
                            break;
                        }
                    },
                    _ => {} // no code yet
                }

                let code_length = self.range(1..3, gen.next_u64());
                code = Some(self.gen_code(code_length, &mut gen));
            }
            
            println!("[{}] made code: {:?}", ch, code);

            self.set.insert(ch, match &code {
                Some(x) => x.clone(),
                _ => panic!("no code char")
            });

            self.revset.insert(match &code {
                Some(x) => x.clone(),
                _ => panic!("no code char")
            }, ch);
        }

        self.set.insert(' ', SPACE.to_string());
        self.revset.insert(SPACE.to_string(), ' ');
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