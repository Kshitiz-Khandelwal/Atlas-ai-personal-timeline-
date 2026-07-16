pub mod schema;

use rusqlite::Connection;
use crate::errors::Result;

pub fn init(conn: &Connection) -> Result<()> {
    schema::initialize_schema(conn)
}
