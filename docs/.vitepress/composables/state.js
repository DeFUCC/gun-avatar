
import { reactive, computed, toRef, onMounted } from "vue";
import { useRefHistory, useIntervalFn, useClipboard } from '@vueuse/core'


export const state = reactive({
	initiated: false,
	pair: {
		pub: "iKHPHYhoGOx7liITJ3FU2bqS-Y-6whN3RR7hHAlm9KU.HMIVC_Qejh4ADVEv4FhH6YKPLGiPOS_w2z7czF12PbE",
		priv: "oDVnz7N06gJDoNqFmJbQPTwkXXVCOKMLEuGHBd7faZg",
		epub: "GcA7UOQyRPo8GlG1PCTOfcOjwvfxNgvdAjILC7NM9gc.T7yZYjlb7iJWxokcI01oCGTGAK8XDBgks9hXA-FDkeY",
		epriv: "Tr9_a9sWJbo7EI0ARB5VeptIBALFuVNkSkrRAuP8vQc",
	},
	pub: computed(() => state.pair.pub),
	options: {
		size: 200,
		reflect: true,
		dark: false,
		draw: 'circles',
		round: true
	},
	loop: 0,
	setPair(pair) {
		state.pair = pair
	}
})

state.history = useRefHistory(toRef(state, 'pair'))

const source = computed(() => JSON.stringify(state.pair))
state.clip = useClipboard({ source })

export function useState() {

	if (!state.initiated && !import.meta?.env?.SSR) {

		import('gun/gun').then(() => {
			import('gun/sea').then(async SEA => {
				state.generatePair = async function () {
					state.pair = await SEA.pair()
				}
			})
		})
		onMounted(() => {
			state.loop = useIntervalFn(() => {
				state.generatePair()
			}, 2000)
		})
		state.initiated = true
	}

	return state
}

