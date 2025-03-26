
import { reactive, computed, toRef, onMounted, nextTick } from "vue";
import { useRefHistory, useIntervalFn, useClipboard, onKeyStroke } from '@vueuse/core'
import { parsePub } from "../../../src/main";
import { useData } from "vitepress";

export const state = reactive({
	initiated: false,
	pair: {
		pub: "iKHPHYhoGOx7liITJ3FU2bqS-Y-6whN3RR7hHAlm9KU.HMIVC_Qejh4ADVEv4FhH6YKPLGiPOS_w2z7czF12PbE",
		priv: "oDVnz7N06gJDoNqFmJbQPTwkXXVCOKMLEuGHBd7faZg",
		epub: "GcA7UOQyRPo8GlG1PCTOfcOjwvfxNgvdAjILC7NM9gc.T7yZYjlb7iJWxokcI01oCGTGAK8XDBgks9hXA-FDkeY",
		epriv: "Tr9_a9sWJbo7EI0ARB5VeptIBALFuVNkSkrRAuP8vQc",
	},
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

		import('gun/sea/pair.js').then(async SEA => {
			state.generatePair = async function () {
				state.pair = await SEA.default()
			}
			await state.generatePair()
			onKeyStroke('Enter', () => {
				state.generatePair()
			})
		})


		onMounted(async () => {

			state.loop = useIntervalFn(async () => {
				await state.generatePair()
			}, 2000)

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

