use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub fn seed_from(password: String) -> u64 {
    let mut s = DefaultHasher::new();
    password.hash(&mut s);
    s.finish()
}