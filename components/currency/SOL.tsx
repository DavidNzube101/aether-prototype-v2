import { Image } from 'react-native';

export default function SOLANA() {
    const SOLANA_ICON = require("../../assets/solana-icon.png")

    return (
        <Image
            source={SOLANA_ICON}
            style={{
                width: 24,
                height: 24,
                borderRadius: 12,
            }}
        />
    )
}