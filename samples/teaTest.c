#include <stdint.h>
#include <stdio.h>

uint32_t seed = 0;

uint32_t prng(){
    seed *= 0x19660D;
    seed += 0x3C6EF35F;
    return seed;
}

void encrypt (uint32_t* v, uint32_t* k) {
    uint32_t v0=v[0], v1=v[1], sum=0, i;           /* set up */
    uint32_t delta=0x9e3779b9;                     /* a key schedule constant */
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */
    for (i=0; i < 32; i++) {                       /* basic cycle start */
        sum += delta;
        v0 += ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        v1 += ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
    }                                              /* end cycle */
    v[0]=v0; v[1]=v1;
}

void decrypt (uint32_t* v, uint32_t* k) {
    uint32_t v0=v[0], v1=v[1], sum=0xC6EF3720, i;  /* set up */
    uint32_t delta=0x9e3779b9;                     /* a key schedule constant */
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */
    printf("%08x %08x\n",v0,v1);
    for (i=0; i<32; i++) {                         /* basic cycle start */
        v1 -= ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
        v0 -= ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        sum -= delta;
        if(i<5) printf("%08x %08x\n",v0,v1);
    }                                              /* end cycle */
    v[0]=v0; v[1]=v1;
}

uint32_t key[] = {0x55FEF630,0x62BF0BC1,0xC9B37C34,0x973E29FB};
uint32_t value[] = {0,0};

void main(int argc, char *argv[]){
	if(argc == 1){
		printf("Usage: t|p");
		return;
	}
	if(argv[1][0] == 'p'){
		printf("%08x\n",prng());
		printf("%08x\n",prng());
		printf("%08x\n",prng());
		printf("%08x\n",prng());
	}
	if(argv[1][0] == 't'){
		value[0] = 0; 
		value[1] = 0;
		encrypt(value,key);
		printf("ENCRYPT 0000000000000000 %08x%08x\n",value[0],value[1]);
		decrypt(value,key);
		printf("DECRYPT 0000000000000000 %08x%08x\n",value[0],value[1]);

		// value[0] = 0xFFFFFFFF; 
		// value[1] = 0xFFFFFFFF;
		// encrypt(value,key);
		// printf("ENCRYPT ffffffffffffffff %08x%08x\n",value[0],value[1]);

		// value[0] = 0; 
		// value[1] = 0x00000001;
		// encrypt(value,key);
		// printf("ENCRYPT 0000000000000001 %08x%08x\n",value[0],value[1]);
	}
}