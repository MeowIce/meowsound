import { Message } from "discord.js";
import { Player } from "erela.js";
import MeowAudio from "./MeowAudioCore";

declare class SuperPlayer extends Player {
    private resumeMessage: Message<boolean>;
    private pausedMessage: Message<boolean>;
    private nowPlayingMessage: Message<boolean>;


    public setResumeMessage(client: MeowAudio, message: Message): Message<boolean>;
    public setPausedMessage(client: MeowAudio, message: Message): Message<boolean>;
    public setNowplayingMessage(client: MeowAudio, message: Message): Message<boolean>;
}

export default SuperPlayer;
