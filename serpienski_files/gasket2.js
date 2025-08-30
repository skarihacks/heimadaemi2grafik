"use strict";

var gl, points = [];

var NumTimesToSubdivide = 6;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); return; }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var a = vec2(-1, -1),
      b = vec2( 1, -1),
      c = vec2( 1,  1),
      d = vec2(-1,  1);

  points = [];
  divideSquare(a, b, c, d, NumTimesToSubdivide);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};


function square(a, b, c, d) {
  points.push(a, b, c);
  points.push(a, c, d);
}

function bilerp(a, b, c, d, u, v) {
  var bottom = mix(a, b, u);   
  var top    = mix(d, c, u);  
  return mix(bottom, top, v); 
}

function grid16(a, b, c, d) {
  var U = [0.0, 1.0/3.0, 2.0/3.0, 1.0];
  var V = [0.0, 1.0/3.0, 2.0/3.0, 1.0];
  var G = new Array(4);
  for (var vi = 0; vi < 4; ++vi) {
    G[vi] = new Array(4);
    for (var ui = 0; ui < 4; ++ui) {
      G[vi][ui] = bilerp(a, b, c, d, U[ui], V[vi]);
    }
  }
  return G;
}

function divideSquare(a, b, c, d, count) {
  if (count === 0) { square(a, b, c, d); return; }

  var G = grid16(a, b, c, d);  

  --count;
  for (var r = 0; r < 3; ++r) {
    for (var cIdx = 0; cIdx < 3; ++cIdx) {
      if (r === 1 && cIdx === 1) continue; 
      var ll = G[r][cIdx];       
      var lr = G[r][cIdx+1];   
      var ur = G[r+1][cIdx+1];   
      var ul = G[r+1][cIdx];    
      divideSquare(ll, lr, ur, ul, count);
    }
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
