# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.34/1.0.35] - 2018-12-20
### Changed
- Added config parameter 'nestedKey' to AMActions
- Added config parameter 'nestedKey' to AMCacheActions

## [1.0.26] - 2018-08-31
### Changed
- Safer data support and getObjects fix for routes that dont end with '/'

## [1.0.24] - 2018-08-31
### Changed
- AMActions supports `data` field in response for getObjects

## [1.0.23] - 2018-08-31
### Changed
- Cache only create fake_id for valid objects

## [1.0.22] - 2018-04-24
### Changed
- AmActions and AMCache actions config now accepts optional updateSufix, createSufix, deleteSufix parameters.

## [1.0.18/1.0.21] - 2018-04-06
### Changed
- AMCache.getObjects can keep the cache with 'persistCache' on config
### Fixed
- Cache have fakeId even if no cache was defined before
- Only create fakeId on arrays of objects

## [1.0.17] - 2018-03-27
### Changed
- AMCache.getObjects erase the cache on cacheOnline too

## [1.0.16] - 2017-01-10
### Added
- resetObjects in cacheActions

## [1.0.14/1.0.15] - 2017-12-18
### Fixed
- Cache deleteObjects bug fixed

## [1.0.13] - 2017-12-12
### Fixed
- Cache GetObject bug

## [1.0.10/1.0.12] - 2017-12-07
### Fixed
- babel.rc dependencies added

## [1.0.7 / 1.0.9] - 2017-12-01
### Added
- saveObjectCache added to AMCacheActions

## [1.0.6] - 2017-11-13
### Added
- AMCacheActions first steps to offline data

## [1.0.3 / 1.0.5] - 2017-11-13
### Added
- AMActions.setup() method

### Changed
- Some change

### Removed
- Some remove