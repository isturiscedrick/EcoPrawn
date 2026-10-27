interface EcoPrawnSerialPort {
  readable: ReadableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}
interface Navigator {
  readonly serial?: {
    requestPort(options?: { filters?: { usbVendorId: number; usbProductId?: number }[] }): Promise<EcoPrawnSerialPort>;
  };
}
