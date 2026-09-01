# AIhance

A community app for discovering image styles and applying them to your own photos. Users browse a feed of Posts, copy a style or prompt, and Restyle their image — first by Handoff to an external AI app, later in-app.

## Auth

**v1:** Consumers browse, Handoff, and Report without sign-in. Admin moderation uses a shared secret.

**v1+:** Consumers and Producers sign in (Apple/Google via better-auth; see ADR-0002). Sign-in is required to use the app and binds per-user actions like Report and posting to a real account instead of client-supplied ids.

## Language

**Post**:
Community content consisting of an image and an optional prompt that describes how the image was generated or the style it represents.
_Avoid_: Pin, upload, submission

**Producer**:
A user who publishes Posts to the community feed.
_Avoid_: Creator, poster, uploader

**Consumer**:
A user who browses the feed, views Posts, and may apply a Post's style to their own image.
_Avoid_: Viewer, browser, lurker

**Prompt**:
Text attached to a Post that describes how the image was generated or the style to reproduce.
_Avoid_: Caption, description, tags

**Restyle**:
Applying the visual style from a reference Post to the user's own image using AI.
_Avoid_: Enhance, transform, remix, apply style

**Handoff**:
Sending a Post's image and/or prompt to an external AI app (e.g. ChatGPT) so the Consumer can Restyle outside AIhance.
_Avoid_: Export, share, redirect

**Report**:
A Consumer flagging a Post that is not a usable AI style reference — spam, NSFW, memes, ads, or other off-topic content.
_Avoid_: Flag, block, dislike

**Tag**:
A label from a curated list that groups a Post by style or theme (e.g. "anime", "watercolor"). Consumers tap a Tag to filter the feed. Producers pick from the same list when posting.
_Avoid_: Category, label, hashtag

**Feed**:
The scrollable grid of Posts a Consumer browses. Filterable by Tag.
_Avoid_: Timeline, gallery, board
