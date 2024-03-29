export type Tag = { path: string, name: string }

export const Tags: Tag[] = [
    { path: 'kali', name: 'Kali Linux'},
    { path: 'linux', name: 'Linux' },
    { path: 'python', name: 'Python' },
    { path: 'ubuntu', name: 'Ubuntu' },
    { path: 'vbox', name: 'VirtualBox'},
    { path: 'virustotal', name: 'VirusTotal'},
    { path: 'forDebug', name: 'forDebug'},
]

export const tagIconStyle = {
    box: {
        display: 'inline-block'
    },
    btn: {
        margin: '.2em',
        padding: '.6em',
        color: '#555555',
        lineHeight: '.5em',
        fontSize: '.8em',
        backgroundColor: '#f9f9f9',
        border: '1px solid #aaaaaa',
        borderRadius: '.4em',
    }
}
