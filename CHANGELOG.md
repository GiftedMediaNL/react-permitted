# Changelog

## 1.1.3

### Patch Changes

- 52ac678: changelog workflow update

## 1.1.2

### Patch Changes

- 1c69ceb: Added changeset for automated changelogs

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project adheres to Semantic Versioning.

Note: Versions up to 1.1.1 were released before a structured changelog was introduced.

## [Unreleased]

### Added

- Mandatory test coverage for core permission matching helpers.
- Improved and more descriptive test names.
- Clearer naming for permission utilities and hooks.

### Changed

- Refactored internal permission matching logic for better readability and maintainability.
- Improved TypeScript typings for permission trees and wildcard patterns.

### Fixed

- Edge cases in wildcard and implied read permission resolution.

---

## [0.1.0] – 2026-01-XX

### Added

- Initial public release of react-permitted.
- Permission tree definition with full TypeScript inference.
- Wildcard and negation based permission matching.
- `usePermitted` hook.
- `ShowIfPermitted` component.
- `RequireRoutePermission` wrapper for React Router v6.
