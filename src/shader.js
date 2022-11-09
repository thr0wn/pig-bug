import * as THREE from "three";
import { pig } from "./constants";

class Shader {
  constructor() {
    this.mesh = new THREE.Group();
    this.load();
  }

  load() {
    const loader = new THREE.TextureLoader();
    loader.load(pig, (texture1) => {
      const geometry = new THREE.PlaneGeometry(50, 50);
      const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        vertexColors: true,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
          },
          uTexture1: { value: texture1 }
        },
        vertexShader: `
        varying vec2 vUv;

        void main()	{
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
        }
      `,
        fragmentShader: `
        #define ss(a,b,t) smoothstep(a,b,t)

        uniform vec2 uResolution;
        uniform float uTime;
        uniform sampler2D uTexture1;
        
        mat2 rot (float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
        
        // Dave Hoskins
        // https://www.shadertoy.com/view/4djSRW
        float hash11(float p){
            p = fract(p * .1031);
            p *= p + 33.33;
            p *= p + p;
            return fract(p);
        }
        float hash12(vec2 p)
        {
          vec3 p3  = fract(vec3(p.xyx) * .1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }
        vec2 hash21(float p)
        {
          vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
          p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.xx+p3.yz)*p3.zy);
        }
        
        void main()
        {
            // coordinates
            vec2 uv = gl_FragCoord.xy/uResolution.xy;
            vec2 p = (gl_FragCoord.xy-uResolution.xy/2.)/uResolution.y;
            float unit = 1./uResolution.y;
            
            // timing
            float time = uTime*10.;
            float anim = fract(time);
            float index = floor(time);
            
            // displace
            vec2 rnd1 = hash21(index)*2.-1.;
            vec2 target = p + rnd1;
            float mask = hash12(floor(uv*hash11(index+78.)*32.)+index);
            float a = 6.283*floor(hash11(index*72.)*4.)/4.;
            vec2 dir = vec2(cos(a),sin(a));
            vec2 offset = (mask) * dir * unit * 50. * hash12(floor(uv*16.));
            
            // spawn frame
            bool spawn = hash12(floor(uv*hash11(index+78.)*20.)+index) > 0.9;
            if (spawn)
            {
                gl_FragColor = texture(uTexture1, uv);
            } else
            {
                gl_FragColor = texture(uTexture1, uv-offset);
            }
        }
        `
      });
      this.material = material;
      this.mesh.add(new THREE.Mesh(geometry, material));
    });
  }

  update(time) {
    if (!this.material) {
      return;
    }
    this.material.uniforms.uTime.value += time / 1000;
  }
}

export default Shader;
