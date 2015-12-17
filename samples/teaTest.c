#include <stdint.h>
#include <stdio.h>

#if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
#define le16_to_cpu(val) (val)
#define le32_to_cpu(val) (val)
#define le64_to_cpu(val) (val)
#define be16_to_cpu(val) __builtin_bswap16(val)
#define be32_to_cpu(val) __builtin_bswap32(val)
#define be64_to_cpu(val) __builtin_bswap64(val)
#endif
#if __BYTE_ORDER__ == __ORDER_BIG_ENDIAN__
#define le16_to_cpu(val) __builtin_bswap16(val)
#define le32_to_cpu(val) __builtin_bswap32(val)
#define le64_to_cpu(val) __builtin_bswap64(val)
#define be16_to_cpu(val) (val)
#define be32_to_cpu(val) (val)
#define be64_to_cpu(val) (val)
#endif

uint32_t seed = 0;

uint32_t prng(){
    seed *= 0x19660D;
    seed += 0x3C6EF35F;
    return seed;
}

void encrypt (uint32_t* v, uint32_t* k) {
    uint32_t v0=v[0],v1=v[1],sum=0, i;           /* set up */
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
    uint32_t v0=v[0],v1=v[1],sum=0xC6EF3720, i;  /* set up */
    uint32_t delta=0x9e3779b9;                     /* a key schedule constant */
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */
    for (i=0; i<32; i++) {                         /* basic cycle start */
        v1 -= ((v0<<4) + k2) ^ v0 + sum ^ ((v0>>5) + k3);
        v0 -= ((v1<<4) + k0) ^ v1 + sum ^ ((v1>>5) + k1);
        sum -= delta;
    }                                              /* end cycle */
    v[0]=v0; v[1]=v1;
}

void decrypt2 (uint32_t* v, uint32_t* k) {
    uint32_t v0=v[0], v1=v[1], sum=0xC6EF3720, i;  /* set up */
    uint32_t delta=0x9e3779b9;                     /* a key schedule constant */
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */
    for (i=0; i<32; i++) {                         /* basic cycle start */
        v1 -= ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
        v0 -= ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        sum -= delta;
    }                                              /* end cycle */
    v[0]=v0; v[1]=v1;
}

uint8_t key1[] = { 0x55, 0xFE, 0xF6, 0x30, 0x62, 0xBF, 0x0B, 0xC1, 0xC9, 0xB3, 0x7C, 0x34, 0x97, 0x3E, 0x29, 0xFB };
uint32_t key2[] = { 0x55FEF630, 0x62BF0BC1, 0xC9B37C34, 0x973E29FB };

uint32_t value[] = {0,0};

void main(int argc, char *argv[]){
	key2[0] = be32_to_cpu(key2[0]);
	key2[1] = be32_to_cpu(key2[1]);
	key2[2] = be32_to_cpu(key2[2]);
	key2[3] = be32_to_cpu(key2[3]);

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
		printf("%02x%02x%02x%02x\n",key2[0],key2[1],key2[2],key2[3]);
		// value[0] = 0; 
		// value[1] = 0;
		// encrypt(value,key);
		// printf("ENCRYPT %08x%08x\n",value[0],value[1]);
		// uint64_t b3 = 0x26e97b280c9fdb47;
		// uint64_t b3 = 0x26e97b280c9fdb47;
		// decrypt((uint32_t*)&b3,(uint32_t*)key1);
		// printf("DECRYPT %0lx\n",b3);
		// b3 = 0x26e97b280c9fdb47;
		// decrypt((uint32_t*)&b3,(uint32_t*)key2);
		// printf("DECRYPT %0lx\n",b3);

		uint32_t b3_32[] = { 0x26e97b28,0x0c9fdb47 };
		b3_32[0] = __builtin_bswap32(b3_32[0]);
		b3_32[1] = __builtin_bswap32(b3_32[1]);
		decrypt(b3_32,(uint32_t*)key1);
		printf("DECRYPT %08x%08x\n",b3_32[0],b3_32[1]);

		//=========================

		uint32_t key[] = { 0x55FEF630, 0x62BF0BC1, 0xC9B37C34, 0x973E29FB };
		key[0] = __builtin_bswap32(key[0]);
		key[1] = __builtin_bswap32(key[1]);
		key[2] = __builtin_bswap32(key[2]);
		key[3] = __builtin_bswap32(key[3]);
		printf("%02x%02x%02x%02x\n",key[0],key[1],key[2],key[3]);
		
		uint32_t b3[] = { 0x26e97b28, 0x0c9fdb47 };
		b3[0] = __builtin_bswap32(b3[0]);
		b3[1] = __builtin_bswap32(b3[1]);
		decrypt(b3,key);
		printf("DECRYPT %08x%08x\n",b3[0],b3[1]);

		encrypt(b3,key);
		b3[0] = __builtin_bswap32(b3[0]);
		b3[1] = __builtin_bswap32(b3[1]);
		printf("ENCRYPT %08x%08x\n",b3[0],b3[1]);

		//=========================

		uint32_t zero[] = { 0x0, 0x0 };
		encrypt(zero,key);
		zero[0] = __builtin_bswap32(zero[0]);
		zero[1] = __builtin_bswap32(zero[1]);
		printf("DECRYPT %08x%08x\n",zero[0],zero[1]);

		zero[0] = __builtin_bswap32(zero[0]);
		zero[1] = __builtin_bswap32(zero[1]);
		decrypt(zero,key);
		printf("ENCRYPT %08x%08x\n",zero[0],zero[1]);

		// value[0] = 0; 
		// value[1] = 0x00000001;
		// encrypt(value,key);
		// printf("ENCRYPT 0000000000000001 %08x%08x\n",value[0],value[1]);
	}
}