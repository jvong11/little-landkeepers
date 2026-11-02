# Saving boundary

Implement browser-local IndexedDB saves in milestone 5 (or earlier to validate state).
Use a versioned serializable save schema and a storage adapter so accounts can be added later.
Three independent slots; preserve last valid saves and report failures. No saves are written by the setup preview.
