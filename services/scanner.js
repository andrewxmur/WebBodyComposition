import Metrics from '@/services/metrics';
var myCharacteristic;

export async function startScan({ age, height, gender, setBodyComposition, setNotification, setScanning, setSerrorMessage, }) {


    setSerrorMessage('');
    let serviceUuid = 'body_composition';
    if (serviceUuid.startsWith('0x')) {
        serviceUuid = parseInt(serviceUuid);
    }

    let characteristicUuid = 'body_composition_measurement';
    if (characteristicUuid.startsWith('0x')) {
        characteristicUuid = parseInt(characteristicUuid);
    }

    try {
        setScanning(true);
        setNotification({
            status: 'Requesting Bluetooth Device...'
        });

        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceUuid] }]
        });
        setNotification({
            status: 'Connecting to GATT Server...'
        });
        const server = await device.gatt.connect();
        setNotification({
            status: 'Getting Service....'
        });
        const service = await server.getPrimaryService(serviceUuid);
        setNotification({
            status: 'Getting Characteristic...'
        });
        myCharacteristic = await service.getCharacteristic(characteristicUuid);

        await myCharacteristic.startNotifications();
        setNotification({
            status: '> Notifications started'
        });
        myCharacteristic.addEventListener('characteristicvaluechanged',
            (e) => { handleNotifications(e, age, height, gender, setBodyComposition, setNotification, setScanning, setSerrorMessage) });

    } catch (error) {
        console.log('Argh! ' + error);
        setScanning(false);
        setSerrorMessage(error.toString());
    }
}

export async function stopScan({ setScanning, setSerrorMessage }) {
    setScanning(false);
    if (myCharacteristic) {
        try {

            await myCharacteristic.stopNotifications();
            myCharacteristic.removeEventListener('characteristicvaluechanged',
                handleNotifications);
        } catch (error) {
            console.log('Argh! ' + error);
            setScanning(false);
            setSerrorMessage(error.toString());
        }
    }
}

export async function handleNotifications(event, age, height, gender, setBodyComposition, setNotification, setScanning, setSerrorMessage) {


    let value = event.target.value;
    let notification = new Uint8Array(value.buffer).toString();
    setNotification({
        status: `received: ${notification}`
    });
    await computeData(value, age, height, gender, setBodyComposition, setScanning, setSerrorMessage);
}

const computeData = async (data, age, height, gender, setBodyComposition, setScanning, setSerrorMessage) => {
    const buffer = new Uint8Array(data.buffer)
    const ctrlByte1 = buffer[1]
    const stabilized = ctrlByte1 & (1 << 5)
    const weight = ((buffer[12] << 8) + buffer[11]) / 200
    const impedance = (buffer[10] << 8) + buffer[9]

    setBodyComposition({
        weight: weight,
        impedance: impedance
    })
    if (impedance > 0 && impedance < 3000 && stabilized) {
        const metrics = new Metrics(weight, impedance, height, age, gender);


        setBodyComposition({
            weight: weight,
            impedance: impedance
            
        });

        await stopScan({ setScanning, setSerrorMessage });
    }
}
