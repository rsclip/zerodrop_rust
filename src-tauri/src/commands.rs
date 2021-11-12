use clipboard::{
    ClipboardProvider,
    ClipboardContext,
};

#[tauri::command]
pub fn copy_text(text: String) -> Result<(), ()> {
    let mut ctx: ClipboardContext = match ClipboardProvider::new() {
        Ok(x) => x,
        Err(_) => {return Err(());}
    };
    match ctx.set_contents(text) {
        Ok(_) => Ok(()),
        Err(_) => Err(()),
    }
}

#[tauri::command]
pub fn paste() -> Result<String, ()> {
    let mut ctx: ClipboardContext = match ClipboardProvider::new() {
        Ok(x) => x,
        Err(_) => {return Err(());}
    };

    match ctx.get_contents() {
        Ok(x) => Ok(x),
        Err(_) => Err(())
    }
}

pub mod embedding {
    use crate::{
        password::seed_from,
        charset::CharacterSet,
    };

    #[tauri::command]
    pub fn embed(input: String, msg: String, password: String) -> Result<String, ()> {
        println!("called with {}, {}, {}", input, msg, password);
        let seed = seed_from(password);
        
        let mut charset = CharacterSet::new(seed);
        charset.gen_set();
        println!("{:#?}", charset.set);

        Ok(charset.embed(input, msg))
    }
}