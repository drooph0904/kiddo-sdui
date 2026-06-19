import { Platform } from 'react-native';
// Android emulator reaches the host machine at 10.0.2.2; iOS sim uses localhost.
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';
