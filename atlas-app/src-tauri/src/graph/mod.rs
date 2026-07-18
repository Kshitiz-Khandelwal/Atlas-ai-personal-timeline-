pub mod schema;
pub mod queries;
pub mod persona_engine;

use rusqlite::Connection;
use crate::errors::Result;

pub fn init(conn: &Connection) -> Result<()> {
    schema::initialize_schema(conn)
}
