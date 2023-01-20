
import Gun from "gun/gun";
import SEA from "gun/sea.js";
import { reactive } from "vue";


export const state = reactive({
	pair: {
		pub: "iKHPHYhoGOx7liITJ3FU2bqS-Y-6whN3RR7hHAlm9KU.HMIVC_Qejh4ADVEv4FhH6YKPLGiPOS_w2z7czF12PbE",
		priv: "oDVnz7N06gJDoNqFmJbQPTwkXXVCOKMLEuGHBd7faZg",
		epub: "GcA7UOQyRPo8GlG1PCTOfcOjwvfxNgvdAjILC7NM9gc.T7yZYjlb7iJWxokcI01oCGTGAK8XDBgks9hXA-FDkeY",
		epriv: "Tr9_a9sWJbo7EI0ARB5VeptIBALFuVNkSkrRAuP8vQc",
	},
	async generatePair() {
		state.pair = await SEA.pair()
	}
})