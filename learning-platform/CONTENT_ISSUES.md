# Curriculum content issues (report only)

These were discovered during platform ingestion. **Do not treat this file as authorization to rewrite curriculum content.**

## Path / naming

- Mixed README casing: `readme.md` / `Readme.md` / `README.md` (case-sensitive on Linux).
- Mixed chapter prefixes: `ENG-01` … `ENG-08` vs `Eng-09` / `Eng-10`.
- Spaces, `&`, em dash (`—`), and ` -` separators in folder/file names.
- Two extensionless teaching files under ENG-04 (Markdown content without `.md`).

## Links

- Approximately 85 short chapter links of the form `../AGT-02/README.md` do not match full folder names.
- The learning platform attempts prefix-based resolution (`AGT-02` → matching chapter). Unresolved targets are styled as broken links and counted during render.

## Platform note

- Original git paths may include `:` characters. Build and develop on WSL/Linux or CI; Windows NTFS cannot check out those paths.
