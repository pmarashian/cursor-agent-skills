# Why Component Test Scenes

## Isolation

Testing a component inside the full scene (e.g. Settings) mixes that component with navigation, other UI, and game state. Failures are harder to diagnose: is the slider broken, or the modal, or the scene transition? A standalone component test scene contains only the component under test and a minimal harness, so a failure points directly at that component.

## Faster Feedback

Opening the full game, navigating to the right scene, and then exercising the component adds steps and time. Booting `?scene=SliderTestScene` loads only that scene and its assets. Verification is faster and repeatable.

## Clearer Failure Scope

When a test fails on a component test scene, the scope is clear: the component (and its test seam). When a test fails on the full page, the scope is the whole flow. Component test scenes make failures actionable.

## Unit-Test Analogy

For pure logic, unit tests run one function in isolation. For Phaser UI components, a component test scene is the equivalent: one component, one scene, one URL. Build and verify the component there first; then integrate it into the full scene.
