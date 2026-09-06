import { useEffect, useRef, useState } from "react";

/**
 * Reports when a YouTube embed has actually started playing.
 *
 * A muted-autoplay embed still paints its own poster and centre play button for
 * the first moment. That button sits mid-frame, so — unlike the title bar and
 * watermark — no amount of overscan crops it away. The only clean fix is to keep
 * the frame hidden until playback is under way, which the player will tell us if
 * asked: with `enablejsapi=1` it answers a `listening` handshake with state
 * events over postMessage.
 *
 * Returns [ref for the iframe, whether it is playing]. Falls open after a
 * timeout so a blocked or silent player never leaves the hero stuck on its still.
 */
export function useYouTubePlaying(enabled: boolean, timeoutMs = 4000) {
    const ref = useRef<HTMLIFrameElement | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (!enabled || playing) return;

        const onMessage = (event: MessageEvent) => {
            /* The page gets postMessage traffic from other embeds and extensions;
               only the player's own frame is of interest. */
            if (event.source !== ref.current?.contentWindow) return;
            if (!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(event.origin)) return;
            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                /* 1 = playing, per the IFrame API's player states. */
                if (data?.info?.playerState === 1) setPlaying(true);
            } catch {
                /* Not one of ours — the player also emits non-JSON chatter. */
            }
        };
        window.addEventListener("message", onMessage);

        /* The player only starts emitting once it has been subscribed to, and it
           ignores the handshake until it is ready, so it is repeated briefly. */
        const handshake = window.setInterval(() => {
            ref.current?.contentWindow?.postMessage(
                JSON.stringify({ event: "listening", id: "hero-video", channel: "widget" }),
                "*"
            );
        }, 250);
        const fallback = window.setTimeout(() => setPlaying(true), timeoutMs);

        return () => {
            window.removeEventListener("message", onMessage);
            window.clearInterval(handshake);
            window.clearTimeout(fallback);
        };
    }, [enabled, playing, timeoutMs]);

    return [ref, playing] as const;
}
