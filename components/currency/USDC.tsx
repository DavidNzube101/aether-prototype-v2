import { Image } from 'react-native';

export default function USDC() {
    const USDC_ICON = require("../../assets/usdc-icon.png")

    return (
        <Image
            source={USDC_ICON}
            style={{
                width: 24,
                height: 24,
                borderRadius: 12,
            }}
        />
    )
}