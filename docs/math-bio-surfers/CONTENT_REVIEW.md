# Teaching content and source review

Source: Thomas E. Woolley, *Mathematical Biology*, full notes dated 16 October 2025. The LaTeX master includes Introduction, Population_modelling, Spatial_systems, Pattern_formation and Appendices. Introduction.tex contains Chapters 1 and 2. Questions use the substantive Chapters 2–5 as four game levels. PDF page numbers below are the printed page numbers.

| Level | Notes pages | Main coverage |
| --- | --- | --- |
| 1 | 6–23 | Autonomous ODEs; mass-action rates and stoichiometry; conserved quantities; scales and initial conditions; steady states; scalar and two-variable linear stability; Schnakenberg kinetics; Hill functions; nullclines and flow directions |
| 2 | 24–46 | Closed-population balances; Malthus and logistic growth; saturating budworm predation; bistability; SIR conservation, reproduction number and infection peak; discrete fixed points; stability multipliers; logistic-map period-two cycles |
| 3 | 47–59 | Diffusion and taxis; lattice scaling and Taylor expansion; dimensions; Dirichlet, Neumann and Robin conditions; mass balance; moving coordinates; Fisher fronts, end states and minimum speed |
| 4 | 60–78 | French flag thresholding; diffusion–decay gradients; source perturbations; kinetic stability; modal matrices; determinant and discriminant conditions; quantised wavenumbers; domain size; equal diffusion; activator–inhibitor ordering; the course-specific Schnakenberg parameters; limits of mechanistic evidence |

The introduction is presented in the menu; appendix concepts are included in the stability material. The bank uses short conceptual questions and small calculations. It is a revision aid, with written derivations and full problem sheets still needed to assess deeper understanding. Procedural challenges follow a specified valid workflow, rather than claiming that no alternative solution order exists.

## Clarifications used in the game

These observations do not modify the supplied course notes.

| Source | Point checked | Treatment in the game |
| --- | --- | --- |
| §2.2 | The general mass-action equations use products minus reactants, but the following prose gives the reversed stoichiometric sign | Questions consistently use net change bᵢ − aᵢ |
| §§2.4–2.5 and stability tables | Lyapunov stability and asymptotic attraction are sometimes described together; linear criteria at zero real parts require care | Strict negative real parts imply local asymptotic stability. Zero real parts are explicitly inconclusive for a general nonlinear system |
| §2.5, Schnakenberg example | In the unstable region eigenvalues can be complex, so writing both as positive is too restrictive | Classifications use eigenvalue real parts |
| §2.6.1, Hill functions | The final small-x limit in the m < n discussion appears where a large-x limit is intended | The question states x → ∞ and uses x^(m − n) → 0 |
| §3.1.1 | The incidence is density-dependent rSI and the reproduction number is written ρ | Preserve ρ = rS₀/a and the course notation, without silently switching to a frequency-dependent model |
| §3.2.3 | Fixed points also solve the two-step fixed-point equation | Explicitly exclude them when identifying genuine period-two cycles |
| §4.1 | Mass conservation depends on boundary flux and sources | State the pure-diffusion assumption; clarify the extra reaction contribution for reaction–diffusion models |
| §5.1 | The two exponential exponents have opposite signs; a displayed auxiliary-root line omits ± | Use the equivalent cosh solution and check both boundary conditions directly |
| §5.2.3, equation labelled T4 | The intermediate discriminant drops the kinetic derivatives, although the later collected condition TT4 contains them | Use (Dᵥfᵤ + Dᵤgᵥ)² − 4DᵤDᵥ det(J), consistent with TT4 |
| §5.2.4 | Schnakenberg parameters differ from another common convention | Use f = α − u + u²v and g = β − α − u²v, giving (β,(β − α)/β²) |
| §5.2.3 | Modal growth is a linear result | Explicitly distinguish initial growth rates from final nonlinear amplitudes |

No new biological claims or clinical guidance are introduced. The limb-bud and pattern-evidence questions test the mechanisms discussed in the notes. Page and section references refer to the supplied 2025 version.

## Attribution

Original runner engine: [Gradient Surfers](https://github.com/omaclaren/open-learning-material/tree/master/docs/engsci-205/2026/gradient-surfers), from Oliver Maclaren’s open-learning-material repository, MIT licence. Course notes: Thomas E. Woolley, based on notes by Prof. Eamonn A. Gaffney. Questions and chapter progression were prepared for this adaptation with ChatGPT. The full notes and their illustrations are not included in this repository addition.
