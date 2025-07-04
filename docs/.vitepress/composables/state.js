
import { reactive, computed, toRef, onMounted, nextTick } from "vue";
import { useRefHistory, useIntervalFn, useClipboard, onKeyStroke } from '@vueuse/core'
import { parsePub } from "../../../src/pub";
import { useData } from "vitepress";

import derivePair from '@gun-vue/gun-es/derive'

export const state = reactive({
	initiated: false,
	pair: { "pub": "gioAcuL3KHDJFUWzNEkPkcgcw_HwqVv6avvYkBCcvJM.fguD_Qq2cYTrD5yFL29-TfJbnVn0N60PdUALdfKiR-8", "priv": "hIbw7KcuLFWBMvjFiyTm9k7X2lGeKoU4uu1bvBTUzqE", "epub": "gBjaZTpHcnlCLsqtELiH-T6SxaYT5UsNvPbF2MMFLOk.hWoiw7E2eoLtFFsbBDRNPYHX3Db-0AlZTkIMn-3Byy8", "epriv": "GAhTKw1A2yQfpS8nRVE7zKNu4uBCXdRFmRmtMq7j90s" },
	pub: computed(() => state.pair.pub),
	parsed: computed(() => parsePub(state.pub)),
	options: {
		size: 200,
		reflect: true,
		dark: false,
		draw: 'circles',
		round: true
	},
	loop: {},
	interval: 2000,
	setPair(pair) {
		state.pair = pair
	}
})

state.history = useRefHistory(toRef(state, 'pair'))

const source = computed(() => JSON.stringify(state.pair))
state.clip = useClipboard({ source })

export function useState() {
	if (import.meta.env.SSR) return state
	if (!state.initiated) {

		onMounted(async () => {

			state.generatePair = async function () {
				state.pair = await derivePair("a" + Math.random() * 1000)
			}
			await state.generatePair()
			onKeyStroke('Enter', () => {
				state.generatePair()
			})

			state.loop = useIntervalFn(async () => {
				await state.generatePair()
			}, 4000, { immediate: false })

			onKeyStroke('ArrowLeft', () => {
				state.history.undo()
			})
			onKeyStroke('ArrowRight', () => {
				state.history.redo()
			})
		})
		state.initiated = true
	}

	return state
}

