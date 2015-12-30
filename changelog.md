**0.1.2-beta**
- Changed build process to use bluebirdCoroutines for async/await.
- Removed uglify in build process (not compatable with bluebirdCoroutines).
- Fixed bug where if no '/' route exists, Blackbeard was trying to read dir as file.
- Fixed another bug where returning strings/numbers from action was breaking.

**0.1.1-beta**
- Changed the setup script to include Redis configuration.
- Changed `Blackbeard.__setup__` to use the new cache/Redis settings.