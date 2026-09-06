/**
 * Background video sources come from the CMS as a single free-text field, so the
 * editor can paste whatever link they have to hand. Two shapes actually work as a
 * looping hero backdrop: a direct file URL (.mp4/.webm/.ogv), which a <video> can
 * play, and a YouTube link, which has to go through an <iframe> embed. Everything
 * else is treated as a file and left to the browser.
 */

export type HeroVideoSource =
    | { kind: "youtube"; id: string; embedUrl: string }
    | { kind: "file"; src: string };

/**
 * Pulls the 11-character video id out of the YouTube link shapes people paste:
 * youtu.be/ID, /watch?v=ID, /embed/ID, /shorts/ID, /live/ID, /v/ID — with or
 * without a protocol, and with any trailing query (?list=..., ?t=...) ignored.
 * Returns null for anything that isn't YouTube.
 */
export function youTubeId(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;

    const match = trimmed.match(
        /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i
    );
    return match ? match[1] : null;
}

/**
 * Classifies a CMS video URL so the hero can pick the right element. Callers
 * should skip rendering entirely when the field is blank.
 */
export function parseHeroVideo(url: string): HeroVideoSource | null {
    const trimmed = (url || "").trim();
    if (!trimmed) return null;

    const id = youTubeId(trimmed);
    if (id) {
        /* Muted autoplay is the only kind browsers allow unprompted. loop needs
           playlist=<id> to actually repeat a single video, and the chrome params
           keep the frame reading as a backdrop rather than a player. */
        const params = new URLSearchParams({
            autoplay: "1",
            mute: "1",
            loop: "1",
            playlist: id,
            controls: "0",
            showinfo: "0",
            rel: "0",
            modestbranding: "1",
            iv_load_policy: "3",
            disablekb: "1",
            playsinline: "1",
            fs: "0",
            cc_load_policy: "0",
            /* Lets the hero listen for the moment playback actually starts, so
               the frame can stay hidden until then. See Hero.tsx. */
            enablejsapi: "1",
        });
        return { kind: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${params}` };
    }

    return { kind: "file", src: trimmed };
}
