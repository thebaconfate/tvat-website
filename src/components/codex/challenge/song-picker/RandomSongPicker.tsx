import { useState } from "react"
import { Language, type Song } from "../../../../lib/codex-challenge"
import "./random-song-picker.css"

interface Props {
    songs: Song[]
}

export default function RandomSongPicker({ songs }: Props) {
    const [song, setSong] = useState<Song | null>(null)
    const dutchSongs = songs.filter((song) => song.language == Language.DUTCH)
    const frenchSongs = songs.filter((song) => song.language == Language.FRENCH)
    const germanSongs = songs.filter((song) => song.language == Language.GERMAN)
    const otherSongs = songs.filter((song) => (song.language.includes(Language.ENGLISH)) || (song.language.includes(Language.OTHER)))


    function makeRandomFunction(langlist: Song[]) {
        return (_: React.MouseEvent<HTMLButtonElement>) => {
            const randIdx = Math.floor(Math.random() * langlist.length)
            setSong(langlist[randIdx])
        }
    }


    return <div className="picker">
        <div className="buttons">
            <button className="lang" onClick={makeRandomFunction(dutchSongs)}>Nederlands</button>
            <button className="lang" onClick={makeRandomFunction(frenchSongs)}>Frans</button>
            <button className="lang" onClick={makeRandomFunction(germanSongs)}>Duits</button>
            <button className="lang" onClick={makeRandomFunction(otherSongs)}>Engels en anderstalig</button>
        </div>
        <div className="result">
            {
                song ? <div className="song">
                    <p>Titel: {song.title}</p>
                    <p>Pagina: {song.page}</p>
                    {
                        song.description ? <p>{song.description}</p> : ""
                    }

                </div> : ""
            }
        </div>
    </div>


}
