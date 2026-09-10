# Hover Video Projects Design

## Approved outcome

Keep the first twelve existing image projects exactly as they are. Replace project positions 13 through 22 with the ten user-supplied videos, preserving the current two-column gallery, drag/wheel travel, pointer-velocity distortion, curved media surface, depth recession, and contact finale.

The gallery remains desktop-only and contains twenty-two projects in total.

## Project order and copy

The ten videos appear in the exact order in which the user supplied them:

| Position | Source video | Visible title | Visible description |
| --- | --- | --- | --- |
| 13 | `真人电影-简单4.mp4` | `Cinematic Study 01` | `AI Live-Action Film` |
| 14 | `真人电影-简单3 (1).mp4` | `Cinematic Study 02` | `AI Live-Action Film` |
| 15 | `广告-困难3.mp4` | `Commercial Study 01` | `AI Advertising Film` |
| 16 | `广告-简单3.mp4` | `Commercial Study 02` | `AI Advertising Film` |
| 17 | `游戏CG-困难1.mp4` | `Game Cinematic 01` | `AI Game CG` |
| 18 | `冷蓝游戏宣传PV - 副本.mp4` | `Cold Blue` | `Game Promotional Film` |
| 19 | `年轻剑士与黑甲骑士最终斩击_2K_60fps - 副本.mp4` | `Final Strike` | `Fantasy Action Film` |
| 20 | `AI幻觉纸拼贴最终成片-15秒-2K-48fps.mp4` | `AI Hallucination` | `Paper Collage Film` |
| 21 | `midnight-line-final-title-sequence.mp4` | `Midnight Line` | `Title Sequence` |
| 22 | `都市断层游戏PV.mp4` | `Urban Fault` | `Game Promotional Film` |

All visible gallery copy remains English. The first twelve project records, titles, descriptions, images, and order remain unchanged.

## Interaction

Each video project displays a still poster while idle. The poster is generated from that video's opening frame and is used by both the DOM fallback and WebGL plane.

When the pointer enters a video project:

- that video starts automatically;
- playback is muted and loops;
- the WebGL plane switches from the poster texture to the playing video texture;
- all existing bend, depth, and pointer-velocity shader effects remain active.

When the pointer leaves:

- playback pauses immediately;
- the playhead returns to the beginning;
- the WebGL plane switches back to the poster;
- no fixed ripple or looping idle deformation is added.

Only one preview may be active at a time. Moving directly from one video project to another stops and resets the previous preview before activating the next.

## Rendering architecture

The centralized project model keeps `image` as the still/poster source and gains an optional `video` path. This preserves all current image-loading behavior for the first twelve projects and lets video projects fall back gracefully to a still image.

The metadata layer owns hover state because its card geometry already matches the WebGL project planes. Video projects render a real muted `<video>` element inside the existing media slot. Once WebGL is ready, this element remains visually hidden with the fallback layer but continues to act as the decoder and source for a Three.js `VideoTexture`.

`GalleryPage` stores the active project id and passes it to `GalleryCanvas`. Each `ProjectPlane` always loads its poster texture. For video projects, it binds the matching DOM video element to a `VideoTexture` and swaps the shader's `uTexture` uniform only while that project is active.

## Media preparation and performance

The supplied source files range from 1 MB to roughly 95 MB and include 2K, 48 fps, and 60 fps footage. Serving them unchanged would make first visits unnecessarily heavy. Web copies are therefore encoded as H.264 MP4 with `yuv420p`, fast-start metadata, a maximum width of 1280 pixels, and a maximum frame rate of 30 fps. Audio may remain in the web files for future reuse, but previews are always muted.

The source files are never modified. Optimized copies and WebP posters live under `public/gallery/videos/` with stable ASCII filenames. Videos use metadata-only preload and begin downloading playable media on demand, avoiding ten simultaneous full video downloads.

## Failure behavior and accessibility

If video playback is blocked or a video fails to decode, the poster remains visible and the gallery continues to work. Image projects never create video elements or video textures.

Video previews are decorative portfolio thumbnails: they are muted, have no controls, and use the project's visible title as their accessible label. The existing project title and description remain the primary readable content.

## Scope

This iteration changes only positions 13 through 22 and the supporting hover-preview system. It does not change the first twelve projects, gallery layout, shader art direction, drag/wheel behavior, cover page, contact details, mobile support, project detail pages, or deployment.

## Verification

- Content tests prove the first twelve entries are byte-for-byte unchanged in their visible fields and image paths.
- Content tests prove positions 13 through 22 have the approved English copy, video paths, poster paths, and unique ids.
- Playback tests prove hover starts muted looping playback and pointer leave pauses and resets it.
- Component tests prove only video projects render video elements and only one card is marked active.
- Chrome and Edge browser tests prove a later video starts on hover, advances in time, then pauses and resets after pointer exit.
- Visual QA checks a still video row and an actively playing video row without changing the existing layout, bend, recession, or brightness.
- The final automated gate is lint, unit/component tests, production build, and Chrome/Edge end-to-end tests.
