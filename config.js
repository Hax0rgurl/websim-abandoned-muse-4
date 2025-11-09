export const UI = {
  headerHeight: 75,
  tabContainerHeight: 75
};

export const particleOptions = {
  selector: ".background",
  maxParticles: 150,
  color: ["#03dac6", "#ff0266", "#faebd7"],
  connectParticles: true,
  responsive: [{ breakpoint: 768, options: { maxParticles: 50, connectParticles: false } }]
};

export function initParticles() {
  if (window.Particles && typeof window.Particles.init === "function") {
    window.Particles.init(particleOptions);
  }
}