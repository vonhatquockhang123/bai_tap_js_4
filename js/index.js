// import {kiemTraNhanVien} from './validate.js';
const KEY_LOCAL = "arrNhanVien";
let arrNhanVien = getDataNhanVienLocal();
let arrFilterLoaiNhanVien = [];
renderListNhanVien();

function layDuLieuTuForm(form) {
  if (!form || !(form instanceof HTMLFormElement)) {
    console.error("Lỗi: Không tìm thấy form hợp lệ!");
    return null;
  }

  let formData = new FormData(form);
  let nhanVien = Object.fromEntries(formData);
  return nhanVien;
}
document.getElementById("btnThemNV").onclick = function (e) {
  e.preventDefault();
  let form = document.getElementById("formNhanVien");
  let nhanVien = layDuLieuTuForm(form);

  if (!kiemTraNhanVien(nhanVien)) {
    alert("Dữ liệu nhập vào chưa đúng vui lòng kiếm tra lại các thông tin");
    console.error("Dữ liệu bạn nhập không đúng");
    return;
  }
  nhanVien.luongCB = parseFloat(nhanVien.luongCB) || 0;
  nhanVien.gioLam = parseInt(nhanVien.gioLam) || 0;
  assignMethods(nhanVien);
  arrNhanVien.push(nhanVien);
  saveDataNhanVienLocal();
  renderListNhanVien();
  alert("Thêm nhân viên thành công!");
};
function assignMethods(nhanVien) {
  nhanVien.tongLuongNhanVien = function () {
    let hoSoLuong = 1;
    switch (this.chucvu) {
      case "Sếp":
        hoSoLuong = 3;
        break;
      case "Trưởng phòng":
        hoSoLuong = 2;
        break;
      case "Nhân viên":
        hoSoLuong = 1;
        break;
    }
    return this.luongCB * hoSoLuong;
  };
  nhanVien.loaiNhanVien = function () {
    if (this.gioLam >= 192) {
      return "Xuất sắc";
    } else if (this.gioLam >= 176) {
      return "Giỏi";
    } else if (this.gioLam >= 160) {
      return "Khá";
    } else {
      return "Trung bình";
    }
  };
}
function renderListNhanVien(arr = arrNhanVien) {
  let content = "";
  arr = arr.filter((nv) => nv); 
  for (let nhanVien of arr) {
    assignMethods(nhanVien); 
    content += `<tr>
      <td>${nhanVien.tknv}</td>
      <td>${nhanVien.name}</td>
      <td>${nhanVien.email}</td>
      <td>${nhanVien.ngaylam}</td>
      <td>${nhanVien.chucvu}</td>
      <td>${nhanVien.tongLuongNhanVien().toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
      <td>${nhanVien.loaiNhanVien()}</td>
      <td>
      <button onclick="xoaNhanVien('${nhanVien.tknv}')" class="btn btn-danger">Xoá</button>
      <button onclick="layThongTinNhanVien('${nhanVien.tknv}')" class="btn btn-warning">Sửa</button>
      </td>
    </tr>`;
  }
  document.getElementById("tableDanhSach").innerHTML = content;
}
function saveDataNhanVienLocal() {
  localStorage.setItem(KEY_LOCAL, JSON.stringify(arrNhanVien));
}
function getDataNhanVienLocal() {
  let dataLocal = localStorage.getItem(KEY_LOCAL);
  let arr = dataLocal ? JSON.parse(dataLocal) : [];
  arr = arr.filter((nv) => nv);
  arr.forEach(assignMethods);
  return arr;
}
function xoaNhanVien(tk) {
  console.log(tk);
  let newArrFilter = arrNhanVien.filter((nhanVien) => {
    return nhanVien.tknv != tk;
  });
  arrNhanVien = newArrFilter;
  saveDataNhanVienLocal();
  renderListNhanVien();
}
function layThongTinNhanVien(tk) {
  let nhanVien = arrNhanVien.find((nhanVien) => {
    return nhanVien.tknv === tk;
  });
  if (!nhanVien) {
    console.error("Không tìm thấy nhân viên!");
    return;
  }
  if (nhanVien) {
    console.log(nhanVien);
    let arrField = document.querySelectorAll("#myModal input, #myModal select");
    console.log(arrField);
    for (let field of arrField) {
      let { name } = field;
      field.value = nhanVien[name];
      if (name === "tknv") {
        field.readOnly = true;
      }
    }
  }
  $("#myModal").modal("show");
}
function capNhatThongTinNhanVien() {
  let form = document.querySelector("#myModal form");
  let nhanVien = layDuLieuTuForm(form);
  console.log(nhanVien);
  let viTriCanTim = arrNhanVien.findIndex((item) => {
    return item.tknv === nhanVien.tknv;
  });
  if (viTriCanTim != -1) {
    arrNhanVien[viTriCanTim] = nhanVien;
    saveDataNhanVienLocal();
    renderListNhanVien();
    form.reset;
    document.getElementById("tknv").readOnly = false;
    $("#myModal").modal("hide");
  } else {
    console.error("Không tìm thấy nhân viên cần cập nhật!");
  }
}
document.getElementById("btnCapNhat").onclick = capNhatThongTinNhanVien;
document.getElementById("searchName").oninput = function (event) {
  let keyWord = removeVietnameseTones(event.target.value.toLowerCase());
  let arrFilter = arrNhanVien.filter((nhanVien, index) => {
    let loaiNhanVien1 = nhanVien.loaiNhanVien();
    let convertLoaiNhanVien = removeVietnameseTones(
      loaiNhanVien1.toLowerCase()
    );
    console.log(convertLoaiNhanVien);
    return convertLoaiNhanVien.includes(keyWord);
  });
  console.log(arrFilter);
  arrFilterLoaiNhanVien = arrFilter;
  renderListNhanVien(arrFilterLoaiNhanVien);
};
function kiemTraNhanVien(nhanVien) {
  let isValid = true;
  let tknvPattern = /^[A-Za-z0-9]{6,10}$/;
  if (!nhanVien.tknv || !tknvPattern.test(nhanVien.tknv)) {
    document.getElementById("tbTKNV").innerText =
      "Tài khoản không hợp lệ vui lòng nhập lại";
    alert(
      "Tài khoản chỉ tối đa từ 6 đến 10 ký tự"
    );
    isValid = false;
  } 
  else {
    document.getElementById("tbTKNV").innerText = "";
  }
  let namePattern = /^[A-Za-zÀ-ỹ\s]+$/;
  if (!nhanVien.name || !namePattern.test(nhanVien.name)) {
    document.getElementById("tbTen").innerText = "Cần nhập họ tên đầy đủ không được nhập số";
    alert("Cần nhập họ tên đầy đủ không được nhập số");
    isValid = false;
  } 
  else {
    document.getElementById("tbTen").innerText = "";
  }
  let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!nhanVien.email || !emailPattern.test(nhanVien.email)) {
    document.getElementById("tbEmail").innerText = "Email không hợp lệ!";
    alert("Email không hợp lệ!");
    isValid = false;
  } else {
    document.getElementById("tbEmail").innerText = "";
  }
  let passwordPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/;
  if (!nhanVien.password || !passwordPattern.test(nhanVien.password)) {
    document.getElementById("tbMatKhau").innerText =
      "Mật khẩu 6 - 10 ký tự, phải có ít nhất 1 chữ số, 1 ký tự viết hoa và 1 ký tự đặc biệt!";
    alert("Mật khẩu 6 - 10 ký tự, phải có ít nhất 1 chữ số, 1 ký tự viết hoa và 1 ký tự đặc biệt!");
    isValid = false;
  } else {
    document.getElementById("tbMatKhau").innerText = "";
  }
  let validPositions = ["Sếp", "Trưởng phòng", "Nhân viên"];
  if (!validPositions.includes(nhanVien.chucvu)) {
    document.getElementById("tbChucVu").innerText =
      "Chức vụ phải là Sếp, Trưởng phòng, Nhân viên";
    alert("Vui lòng chọn chức vụ của bạn");
    isValid = false;
  } else {
    document.getElementById("tbChucVu").innerText = "";
  }
  let gioLam = parseInt(nhanVien.gioLam);
  if (!gioLam || gioLam < 80 || gioLam > 200) {
    document.getElementById("tbGiolam").innerText =
      "Giờ làm của bạn phải từ 80 giờ - 200 giờ";
    alert("Giờ làm của bạn phải từ 80 giờ - 200 giờ");
    isValid = false;
  } else {
    document.getElementById("tbGiolam").innerText = "";
  }
  return isValid;
}