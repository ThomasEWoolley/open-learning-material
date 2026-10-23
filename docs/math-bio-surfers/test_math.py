"""Independent numerical checks for the model formulas in the question bank."""
import math

checks=0
def close(a,b,eps=1e-6):
    global checks
    assert abs(a-b) <= eps*max(1,abs(a),abs(b)), (a,b)
    checks+=1

# Chain-rule map multipliers from numerical derivatives of the composed map.
for r in [1.5,2.5,3.1,3.3,3.44]:
    f=lambda x:r*x*(1-x)
    x=1-1/r
    h=1e-6
    close((f(x+h)-f(x-h))/(2*h),2-r)
    if r>3:
        a=(r+1+math.sqrt((r+1)*(r-3)))/(2*r)
        b=f(a)
        close(f(b),a)
        close((f(f(a+h))-f(f(a-h)))/(2*h),-r*r+2*r+4)

# Independently evaluate the diffusion–decay profile and its boundary data.
for D,gamma,L,S in [(1,.1,5,2),(4,1,3,2),(.2,.3,2,1)]:
    ell=math.sqrt(D/gamma)
    u=lambda x:S*math.cosh((L-x)/ell)/math.cosh(L/ell)
    close(u(0),S)
    h=1e-4
    close((u(L+h)-u(L-h))/(2*h),0)
    for x in [L/4,L/2,3*L/4]:
        second=(u(x+h)-2*u(x)+u(x-h))/(h*h)
        close(D*second,gamma*u(x),1e-5)

# Numerically differentiate the course-specific reaction kinetics.
for alpha,beta in [(.1,1),(.2,1.5),(.05,.8)]:
    us=beta;vs=(beta-alpha)/beta**2
    f=lambda u,v:alpha-u+u*u*v
    g=lambda u,v:beta-alpha-u*u*v
    close(f(us,vs),0);close(g(us,vs),0)
    h=1e-6
    fu=(f(us+h,vs)-f(us-h,vs))/(2*h)
    fv=(f(us,vs+h)-f(us,vs-h))/(2*h)
    gu=(g(us+h,vs)-g(us-h,vs))/(2*h)
    gv=(g(us,vs+h)-g(us,vs-h))/(2*h)
    close(fu,1-2*alpha/beta);close(fu*gv-fv*gu,beta**2)
    for Du,Dv,k in [(1,20,.5),(.5,30,1.2),(1,1,2)]:
        determinant=(fu-Du*k*k)*(gv-Dv*k*k)-fv*gu
        polynomial=Du*Dv*k**4-(Dv*fu+Du*gv)*k*k+fu*gv-fv*gu
        close(determinant,polynomial)

# SIR threshold and peak checked against direct short-step integration.
r=.002;a=1;S0=800;I0=2
close(r*S0/a,1.6)
sirS=S0;sirI=I0;peak=I0;dt=1e-4
for _ in range(300000):
    incidence=r*sirS*sirI
    sirS-=dt*incidence
    sirI+=dt*(incidence-a*sirI)
    peak=max(peak,sirI)
predicted=I0+S0-a/r+(a/r)*math.log(a/(r*S0))
close(peak,predicted,2e-4)
close(2*math.sqrt(4*.25),2)
print(f'PASS: {checks} independent mathematical checks (finite differences, boundary conditions and numerical SIR integration).')
