import axios from "axios";
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


interface IVolumeall {
  time: string;
  volume: string;
  totalVolume: string;
};

const historicalVolumeEndpoint = "https://api-mainnet-prod.minswap.org/defillama/v2/volume-series";

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const vols: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data;

  const {totalVolume, volume}= vols
    .find(dayItem => (new Date(Number(dayItem.time)).getTime() / 1000) === dayTimestamp);

  const prices = await axios.post('https://coins.llama.fi/prices', {
    "coins": [
      "coingecko:cardano",
    ],
    timestamp: dayTimestamp
  });

  return {
    timestamp: dayTimestamp,
    dailyVolume: String(Number(volume)/1e6 * prices.data.coins["coingecko:cardano"].price),
    totalVolume: String(Number(totalVolume)/1e6 * prices.data.coins["coingecko:cardano"].price),
  }
}

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data;
  return (new Date(Number(historicalVolume[0].time)).getTime()) / 1000;
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.CARDADO]: {
      start: getStartTimestamp,
      fetch: fetch,
    }
  }
};

export default adapter;
